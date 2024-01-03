'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import { isViemError } from '@webb-tools/web3-api-provider';
import {
  Alert,
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import {
  STAKING_PRECOMPILE_LINK,
  WEBB_TANGLE_DOCS_STAKING_URL,
} from '@webb-tools/webb-ui-components/constants';
import Link from 'next/link';
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

import {
  bondExtraTokens,
  bondTokens,
  evmPublicClient,
  getMaxNominationQuota,
  isNominatorFirstTimeNominator,
  nominateValidators,
  PAYMENT_DESTINATION_OPTIONS,
  updatePaymentDestination,
} from '../../constants';
import { getActiveValidators, getWaitingValidators } from '../../data';
import usePaymentDestinationSubscription from '../../data/NominatorStats/usePaymentDestinationSubscription';
import useTokenWalletBalance from '../../data/NominatorStats/useTokenWalletBalance';
import { PaymentDestination } from '../../types';
import { convertEthereumToSubstrateAddress } from '../../utils';
import AuthorizeTx from './AuthorizeTx';
import BondTokens from './BondTokens';
import SelectDelegates from './SelectDelegates';
import { DelegateTxContainerProps, DelegateTxSteps } from './types';

const CONTRACT_FUNC = 'StakingInterface.sol';

const DelegateTxContainer: FC<DelegateTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { notificationApi } = useWebbUI();
  const { activeAccount } = useWebContext();
  const { data: activeValidatorsData } = useSWR(
    [getActiveValidators.name],
    ([, ...args]) => getActiveValidators(...args)
  );
  const { data: waitingValidatorsData } = useSWR(
    [getWaitingValidators.name],
    ([, ...args]) => getWaitingValidators(...args)
  );

  const [maxNominationQuota, setMaxNominationQuota] = useState<number>(0);

  useEffect(() => {
    getMaxNominationQuota().then((maxNominationQuota) => {
      setMaxNominationQuota(maxNominationQuota ? maxNominationQuota : 16);
    });
  }, []);

  const allValidators = useMemo(() => {
    if (!activeValidatorsData || !waitingValidatorsData) return [];

    return [...activeValidatorsData, ...waitingValidatorsData];
  }, [activeValidatorsData, waitingValidatorsData]);

  const [isFirstTimeNominator, setIsFirstTimeNominator] = useState(true);
  const [delegateTxStep, setDelegateTxStep] = useState<DelegateTxSteps>(
    DelegateTxSteps.BOND_TOKENS
  );
  const [amountToBond, setAmountToBond] = useState<number>(0);
  const [paymentDestination, setPaymentDestination] = useState<string>(
    PaymentDestination.Staked
  );
  const [selectedValidators, setSelectedValidators] = useState<string[]>([]);
  const [isSubmitAndSignTxLoading, setIsSubmitAndSignTxLoading] =
    useState<boolean>(false);

  const isExceedingMaxNominationQuota = useMemo(() => {
    return selectedValidators.length > maxNominationQuota;
  }, [maxNominationQuota, selectedValidators.length]);

  const currentStep = useMemo(() => {
    if (delegateTxStep === DelegateTxSteps.BOND_TOKENS) {
      return '(1/3)';
    } else if (delegateTxStep === DelegateTxSteps.SELECT_DELEGATES) {
      return '(2/3)';
    } else if (delegateTxStep === DelegateTxSteps.AUTHORIZE_TX) {
      return '(3/3)';
    }
  }, [delegateTxStep]);

  const walletAddress = useMemo(() => {
    if (!activeAccount?.address) return '0x0';

    return activeAccount.address;
  }, [activeAccount?.address]);

  const substrateAddress = useMemo(() => {
    if (!activeAccount?.address) return '';

    return convertEthereumToSubstrateAddress(activeAccount.address);
  }, [activeAccount?.address]);

  useEffect(() => {
    try {
      const checkIfFirstTimeNominator = async () => {
        const isFirstTimeNominator = await isNominatorFirstTimeNominator(
          substrateAddress
        );

        setIsFirstTimeNominator(isFirstTimeNominator);
      };

      if (substrateAddress) {
        checkIfFirstTimeNominator();
      }
    } catch (error: any) {
      notificationApi({
        variant: 'error',
        message:
          error.message ||
          'Failed to check if the user is a first time nominator.',
      });
    }
  }, [notificationApi, substrateAddress]);

  const { data: walletBalance, error: walletBalanceError } =
    useTokenWalletBalance(walletAddress);
  const {
    data: currentPaymentDestination,
    error: currentPaymentDestinationError,
  } = usePaymentDestinationSubscription(substrateAddress);

  const amountToBondError = useMemo(() => {
    if (walletBalanceError) {
      notificationApi({
        variant: 'error',
        message: walletBalanceError.message,
      });
    }

    if (!walletBalance) return '';

    if (Number(walletBalance.value1) === 0) {
      return 'You have zero tTNT in your wallet!';
    } else if (Number(walletBalance.value1) < amountToBond) {
      return `You don't have enough tTNT in your wallet!`;
    }
  }, [walletBalanceError, walletBalance, amountToBond, notificationApi]);

  const continueToSelectDelegatesStep = useMemo(() => {
    return isFirstTimeNominator
      ? amountToBond > 0
      : true &&
        !amountToBondError &&
        paymentDestination &&
        walletAddress !== '0x0'
      ? true
      : false;
  }, [
    amountToBond,
    amountToBondError,
    isFirstTimeNominator,
    paymentDestination,
    walletAddress,
  ]);

  const continueToAuthorizeTxStep = useMemo(() => {
    return selectedValidators.length > 0 && !isExceedingMaxNominationQuota
      ? true
      : false;
  }, [isExceedingMaxNominationQuota, selectedValidators.length]);

  const continueToSignAndSubmitTx = useMemo(() => {
    return continueToSelectDelegatesStep && continueToAuthorizeTxStep;
  }, [continueToSelectDelegatesStep, continueToAuthorizeTxStep]);

  const closeModal = useCallback(() => {
    setIsSubmitAndSignTxLoading(false);
    setIsModalOpen(false);
    setAmountToBond(0);
    setPaymentDestination(PaymentDestination.Staked);
    setSelectedValidators([]);
    setDelegateTxStep(DelegateTxSteps.BOND_TOKENS);
  }, [setIsModalOpen]);

  const submitAndSignTx = useCallback(async () => {
    setIsSubmitAndSignTxLoading(true);

    const executeTransaction = async (
      action: any,
      successMessage: string,
      errorMessage: string
    ) => {
      try {
        const txHash = await action();
        if (!txHash) throw new Error(errorMessage);

        const tx = await evmPublicClient.waitForTransactionReceipt({
          hash: txHash,
        });
        if (tx.status !== 'success') throw new Error(errorMessage);

        notificationApi({ variant: 'success', message: successMessage });
      } catch (error) {
        notificationApi({
          variant: 'error',
          message: errorMessage || 'Something went wrong.',
        });

        throw error; // Rethrowing the error to be caught by the outer try-catch
      }
    };

    try {
      if (isFirstTimeNominator) {
        await executeTransaction(
          () =>
            bondTokens(walletAddress, amountToBond, PaymentDestination.Stash),
          `Successfully bonded ${amountToBond} tTNT.`,
          'Failed to bond tokens!'
        );

        await executeTransaction(
          () => updatePaymentDestination(walletAddress, paymentDestination),
          `Successfully updated payment destination to ${paymentDestination}.`,
          'Failed to update payment destination!'
        );

        await executeTransaction(
          () => nominateValidators(walletAddress, selectedValidators),
          `Successfully nominated ${selectedValidators.length} validators.`,
          'Failed to nominate validators!'
        );
      } else {
        if (amountToBond > 0) {
          await executeTransaction(
            () => bondExtraTokens(walletAddress, amountToBond),
            `Successfully bonded ${amountToBond} tTNT.`,
            'Failed to bond tokens!'
          );
        }

        if (currentPaymentDestinationError)
          notificationApi({
            variant: 'error',
            message: currentPaymentDestinationError.message,
          });

        const currPaymentDestination =
          currentPaymentDestination?.value1 === 'Staked'
            ? PaymentDestination.Staked
            : PaymentDestination.Stash;

        if (currPaymentDestination !== paymentDestination) {
          await executeTransaction(
            () => updatePaymentDestination(walletAddress, paymentDestination),
            `Successfully updated payment destination to ${paymentDestination}.`,
            'Failed to update payment destination!'
          );
        }

        await executeTransaction(
          () => nominateValidators(walletAddress, selectedValidators),
          `Successfully nominated ${selectedValidators.length} validators.`,
          'Failed to nominate validators!'
        );
      }
    } catch (error: any) {
      notificationApi({
        variant: 'error',
        message: isViemError(error)
          ? error.shortMessage
          : error.message || 'Something went wrong!',
      });
    } finally {
      closeModal();
    }
  }, [
    amountToBond,
    closeModal,
    currentPaymentDestination?.value1,
    currentPaymentDestinationError,
    isFirstTimeNominator,
    notificationApi,
    paymentDestination,
    selectedValidators,
    walletAddress,
  ]);

  return (
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isModalOpen}
        className="w-full max-w-[1000px] rounded-2xl bg-mono-0 dark:bg-mono-180"
      >
        <ModalHeader titleVariant="h4" onClose={closeModal}>
          Setup Nominator {currentStep}
        </ModalHeader>

        <div className="px-8 py-6">
          {delegateTxStep === DelegateTxSteps.BOND_TOKENS ? (
            <BondTokens
              isFirstTimeNominator={isFirstTimeNominator}
              nominatorAddress={walletAddress}
              amountToBond={amountToBond}
              setAmountToBond={setAmountToBond}
              amountToBondError={amountToBondError}
              amountWalletBalance={
                walletBalance && walletBalance.value1 ? walletBalance.value1 : 0
              }
              paymentDestinationOptions={PAYMENT_DESTINATION_OPTIONS}
              paymentDestination={paymentDestination}
              setPaymentDestination={setPaymentDestination}
            />
          ) : delegateTxStep === DelegateTxSteps.SELECT_DELEGATES ? (
            <SelectDelegates
              validators={allValidators}
              selectedValidators={selectedValidators}
              setSelectedValidators={setSelectedValidators}
            />
          ) : delegateTxStep === DelegateTxSteps.AUTHORIZE_TX ? (
            <AuthorizeTx
              nominatorAddress={walletAddress}
              contractFunc={CONTRACT_FUNC}
              contractLink={STAKING_PRECOMPILE_LINK}
            />
          ) : null}

          {isExceedingMaxNominationQuota && (
            <Alert
              type="error"
              className="mt-4"
              description={`You can only nominate up to ${maxNominationQuota} validators.`}
            />
          )}
        </div>

        <ModalFooter className="px-8 py-6 flex flex-col gap-1">
          {delegateTxStep !== DelegateTxSteps.AUTHORIZE_TX ? (
            <Button
              isFullWidth
              isDisabled={
                (delegateTxStep === DelegateTxSteps.BOND_TOKENS &&
                  !continueToSelectDelegatesStep) ||
                (delegateTxStep === DelegateTxSteps.SELECT_DELEGATES &&
                  !continueToAuthorizeTxStep)
              }
              onClick={() => {
                if (delegateTxStep === DelegateTxSteps.BOND_TOKENS) {
                  setDelegateTxStep(DelegateTxSteps.SELECT_DELEGATES);
                } else if (
                  delegateTxStep === DelegateTxSteps.SELECT_DELEGATES
                ) {
                  setDelegateTxStep(DelegateTxSteps.AUTHORIZE_TX);
                }
              }}
            >
              {delegateTxStep === DelegateTxSteps.BOND_TOKENS
                ? 'Next'
                : amountToBond > 0
                ? 'Stake & Nominate'
                : 'Nominate'}
            </Button>
          ) : (
            <Button
              isFullWidth
              isDisabled={
                delegateTxStep === DelegateTxSteps.AUTHORIZE_TX &&
                !continueToSignAndSubmitTx
              }
              isLoading={isSubmitAndSignTxLoading}
              onClick={submitAndSignTx}
            >
              Sign & Submit
            </Button>
          )}

          {delegateTxStep === DelegateTxSteps.BOND_TOKENS ? (
            <Link href={WEBB_TANGLE_DOCS_STAKING_URL} target="_blank">
              <Button isFullWidth variant="secondary">
                Learn More
              </Button>
            </Link>
          ) : (
            <Button
              isFullWidth
              variant="secondary"
              onClick={() => {
                if (delegateTxStep === DelegateTxSteps.SELECT_DELEGATES) {
                  setDelegateTxStep(DelegateTxSteps.BOND_TOKENS);
                } else if (delegateTxStep === DelegateTxSteps.AUTHORIZE_TX) {
                  setDelegateTxStep(DelegateTxSteps.SELECT_DELEGATES);
                }
              }}
            >
              Go Back
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DelegateTxContainer;
