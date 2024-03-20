'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import { isSubstrateAddress } from '@webb-tools/dapp-types';
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

import { TxConfirmationModal } from '../../components/TxConfirmationModal';
import {
  PAYMENT_DESTINATION_OPTIONS,
  TANGLE_TOKEN_UNIT,
} from '../../constants';
import useRpcEndpointStore from '../../context/useRpcEndpointStore';
import usePaymentDestinationSubscription from '../../data/NominatorStats/usePaymentDestinationSubscription';
import useTokenWalletBalance from '../../data/NominatorStats/useTokenWalletBalance';
import useAllValidatorsData from '../../hooks/useAllValidatorsData';
import useExecuteTxWithNotification from '../../hooks/useExecuteTxWithNotification';
import useIsFirstTimeNominatorSubscription from '../../hooks/useIsFirstTimeNominatorSubscription';
import useMaxNominationQuota from '../../hooks/useMaxNominationQuota';
import { PaymentDestination } from '../../types';
import { convertToSubstrateAddress } from '../../utils';
import {
  bondExtraTokens as bondExtraTokensEvm,
  bondTokens as bondTokensEvm,
  nominateValidators as nominateValidatorsEvm,
  updatePaymentDestination as updatePaymentDestinationEvm,
} from '../../utils/evm';
import {
  bondExtraTokens as bondExtraTokensSubstrate,
  bondTokens as bondTokensSubstrate,
  nominateValidators as nominateValidatorsSubstrate,
  updatePaymentDestination as updatePaymentDestinationSubstrate,
} from '../../utils/polkadot';
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
  const maxNominationQuota = useMaxNominationQuota();
  const allValidators = useAllValidatorsData();

  const [txConfirmationModalIsOpen, setTxnConfirmationModalIsOpen] =
    useState(false);

  const [txStatus, setTxnStatus] = useState<{
    status: 'success' | 'error';
    hash: string;
  }>({
    status: 'error',
    hash: '',
  });

  const executeTx = useExecuteTxWithNotification();

  const [delegateTxStep, setDelegateTxStep] = useState<DelegateTxSteps>(
    DelegateTxSteps.BOND_TOKENS
  );

  const [amountToBond, setAmountToBond] = useState(0);

  const [paymentDestination, setPaymentDestination] = useState<string>(
    PaymentDestination.STAKED
  );

  const [selectedValidators, setSelectedValidators] = useState<string[]>([]);

  const [isSubmitAndSignTxLoading, setIsSubmitAndSignTxLoading] =
    useState(false);

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

    if (isSubstrateAddress(activeAccount?.address))
      return activeAccount.address;

    return convertToSubstrateAddress(activeAccount.address);
  }, [activeAccount?.address]);

  const {
    isFirstTimeNominator,
    isFirstTimeNominatorLoading,
    isFirstTimeNominatorError,
  } = useIsFirstTimeNominatorSubscription(substrateAddress);

  const { data: walletBalance, error: walletBalanceError } =
    useTokenWalletBalance(walletAddress);
  const {
    data: currentPaymentDestination,
    error: currentPaymentDestinationError,
  } = usePaymentDestinationSubscription(substrateAddress);

  useEffect(() => {
    if (walletBalanceError) {
      notificationApi({
        variant: 'error',
        message: walletBalanceError.message,
      });
    }
  }, [notificationApi, walletBalanceError]);

  const amountToBondError = useMemo(() => {
    if (!walletBalance) return '';

    if (Number(walletBalance.value1) === 0) {
      return `You have zero ${TANGLE_TOKEN_UNIT} in your wallet!`;
    } else if (Number(walletBalance.value1) < amountToBond) {
      return `You don't have enough ${TANGLE_TOKEN_UNIT} in your wallet!`;
    }
  }, [walletBalance, amountToBond]);

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
    setPaymentDestination(PaymentDestination.STAKED);
    setSelectedValidators([]);
    setDelegateTxStep(DelegateTxSteps.BOND_TOKENS);
  }, [setIsModalOpen]);

  const { rpcEndpoint } = useRpcEndpointStore();

  const executeDelegate: () => Promise<void> = useCallback(async () => {
    try {
      if (isFirstTimeNominator) {
        await executeTx(
          () =>
            bondTokensEvm(
              walletAddress,
              amountToBond,
              PaymentDestination.STASH
            ),
          () =>
            bondTokensSubstrate(
              rpcEndpoint,
              walletAddress,
              amountToBond,
              PaymentDestination.STASH
            ),
          `Successfully bonded ${amountToBond} ${TANGLE_TOKEN_UNIT}.`,
          'Failed to bond tokens!'
        );

        await executeTx(
          () => updatePaymentDestinationEvm(walletAddress, paymentDestination),
          () =>
            updatePaymentDestinationSubstrate(
              rpcEndpoint,
              walletAddress,
              paymentDestination
            ),
          `Successfully updated payment destination to ${paymentDestination}.`,
          'Failed to update payment destination!'
        );

        const hash = await executeTx(
          () => nominateValidatorsEvm(walletAddress, selectedValidators),
          () =>
            nominateValidatorsSubstrate(
              rpcEndpoint,
              walletAddress,
              selectedValidators
            ),
          `Successfully nominated ${selectedValidators.length} validators.`,
          'Failed to nominate validators!'
        );

        setTxnStatus({ status: 'success', hash });
      } else {
        if (amountToBond > 0) {
          await executeTx(
            () => bondExtraTokensEvm(walletAddress, amountToBond),
            () =>
              bondExtraTokensSubstrate(
                rpcEndpoint,
                walletAddress,
                amountToBond
              ),
            `Successfully bonded ${amountToBond} ${TANGLE_TOKEN_UNIT}.`,
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
            ? PaymentDestination.STAKED
            : PaymentDestination.STASH;

        if (currPaymentDestination !== paymentDestination) {
          await executeTx(
            () =>
              updatePaymentDestinationEvm(walletAddress, paymentDestination),
            () =>
              updatePaymentDestinationSubstrate(
                rpcEndpoint,
                walletAddress,
                paymentDestination
              ),
            `Successfully updated payment destination to ${paymentDestination}.`,
            'Failed to update payment destination!'
          );
        }

        const hash = await executeTx(
          () => nominateValidatorsEvm(walletAddress, selectedValidators),
          () =>
            nominateValidatorsSubstrate(
              rpcEndpoint,
              walletAddress,
              selectedValidators
            ),
          `Successfully nominated ${selectedValidators.length} validators.`,
          'Failed to nominate validators!'
        );

        setTxnStatus({ status: 'success', hash });
      }

      setTxnConfirmationModalIsOpen(true);
    } catch {
      setTxnStatus({ status: 'error', hash: '' });
      setTxnConfirmationModalIsOpen(true);
    }
  }, [
    amountToBond,
    currentPaymentDestination?.value1,
    currentPaymentDestinationError,
    executeTx,
    isFirstTimeNominator,
    notificationApi,
    paymentDestination,
    rpcEndpoint,
    selectedValidators,
    walletAddress,
  ]);

  const submitAndSignTx = useCallback(async () => {
    setIsSubmitAndSignTxLoading(true);

    try {
      await executeDelegate();
    } catch {
      // notification is already handled in executeTx
    } finally {
      closeModal();
    }
  }, [closeModal, executeDelegate]);

  if (
    isFirstTimeNominator == null ||
    isFirstTimeNominatorLoading ||
    isFirstTimeNominatorError
  ) {
    return null;
  }

  return (
    <>
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
                  walletBalance && walletBalance.value1
                    ? walletBalance.value1
                    : 0
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
                Confirm
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

      <TxConfirmationModal
        isModalOpen={txConfirmationModalIsOpen}
        setIsModalOpen={setTxnConfirmationModalIsOpen}
        txStatus={txStatus.status}
        txHash={txStatus.hash}
        txType={isSubstrateAddress(walletAddress) ? 'substrate' : 'evm'}
      />
    </>
  );
};

export default DelegateTxContainer;
