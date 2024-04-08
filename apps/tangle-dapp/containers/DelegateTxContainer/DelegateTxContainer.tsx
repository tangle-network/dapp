'use client';

import { BN, BN_ZERO } from '@polkadot/util';
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
import { type FC, useCallback, useState } from 'react';

import { TxConfirmationModal } from '../../components/TxConfirmationModal';
import { PAYMENT_DESTINATION_OPTIONS } from '../../constants';
import useNetworkStore from '../../context/useNetworkStore';
import usePaymentDestination from '../../data/NominatorStats/usePaymentDestinationSubscription';
import useTokenWalletBalance from '../../data/NominatorStats/useTokenWalletBalance';
import useAllValidators from '../../data/ValidatorTables/useAllValidators';
import useErrorReporting from '../../hooks/useErrorReporting';
import useExecuteTxWithNotification from '../../hooks/useExecuteTxWithNotification';
import useIsFirstTimeNominator from '../../hooks/useIsFirstTimeNominator';
import useMaxNominationQuota from '../../hooks/useMaxNominationQuota';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import { PaymentDestination } from '../../types';
import {
  bondExtraTokens as bondExtraTokensEvm,
  bondTokens as bondTokensEvm,
  nominateValidators as nominateValidatorsEvm,
  updatePaymentDestination as updatePaymentDestinationEvm,
} from '../../utils/evm';
import formatBnToDisplayAmount from '../../utils/formatBnToDisplayAmount';
import {
  bondExtraTokens as bondExtraTokensSubstrate,
  bondTokens as bondTokensSubstrate,
  nominateValidators as nominateValidatorsSubstrate,
  updatePaymentDestination as updatePaymentDestinationSubstrate,
} from '../../utils/polkadot';
import SelectValidators from '../UpdateNominationsTxContainer/SelectValidators';
import AuthorizeTx from './AuthorizeTx';
import BondTokens from './BondTokens';
import { DelegateTxContainerProps, DelegateTxSteps } from './types';

const CONTRACT_FUNC = 'StakingInterface.sol';

const DelegateTxContainer: FC<DelegateTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { notificationApi } = useWebbUI();
  const { activeAccount } = useWebContext();
  const allValidators = useAllValidators();
  const maxNominationQuota = useMaxNominationQuota();
  const [amountToBond, setAmountToBond] = useState<BN | null>(null);
  const [selectedValidators, setSelectedValidators] = useState<string[]>([]);
  const executeTx = useExecuteTxWithNotification();
  const activeSubstrateAddress = useSubstrateAddress();
  const { rpcEndpoint, nativeTokenSymbol } = useNetworkStore();
  const [hasAmountToBondError, setHasAmountToBondError] = useState(false);

  const [txConfirmationModalIsOpen, setTxnConfirmationModalIsOpen] =
    useState(false);

  const [delegateTxStep, setDelegateTxStep] = useState(
    DelegateTxSteps.BOND_TOKENS
  );

  const [paymentDestination, setPaymentDestination] = useState<string>(
    PaymentDestination.STAKED
  );

  const [isSubmitAndSignTxLoading, setIsSubmitAndSignTxLoading] =
    useState(false);

  const isExceedingMaxNominationQuota =
    selectedValidators.length > maxNominationQuota;

  const [txStatus, setTxnStatus] = useState<{
    status: 'success' | 'error';
    hash: string;
  }>({
    status: 'error',
    hash: '',
  });

  const currentStep = (() => {
    if (delegateTxStep === DelegateTxSteps.BOND_TOKENS) {
      return '(1/3)';
    } else if (delegateTxStep === DelegateTxSteps.SELECT_DELEGATES) {
      return '(2/3)';
    } else if (delegateTxStep === DelegateTxSteps.AUTHORIZE_TX) {
      return '(3/3)';
    }
  })();

  const walletAddress = (() => {
    if (!activeAccount?.address) {
      return '0x0';
    }

    return activeAccount.address;
  })();

  const {
    isFirstTimeNominator,
    isLoading: isFirstTimeNominatorLoading,
    isError: isFirstTimeNominatorError,
  } = useIsFirstTimeNominator();

  const { data: walletBalance, error: walletBalanceError } =
    useTokenWalletBalance(walletAddress);

  // TODO: Need to change defaulting to empty/dummy strings to instead adhere to the type system. Ex. should be using `| null` instead.
  const {
    data: currentPaymentDestination,
    error: currentPaymentDestinationError,
  } = usePaymentDestination(activeSubstrateAddress ?? '0x0');

  useErrorReporting(null, walletBalanceError);

  const handleAmountToBondError = useCallback(
    (error: string | null) => {
      setHasAmountToBondError(error !== null);
    },
    [setHasAmountToBondError]
  );

  const continueToSelectDelegatesStep = isFirstTimeNominator
    ? amountToBond !== null && amountToBond.gt(BN_ZERO)
    : true &&
      !hasAmountToBondError &&
      paymentDestination &&
      walletAddress !== '0x0'
    ? true
    : false;

  const continueToAuthorizeTxStep =
    selectedValidators.length > 0 && !isExceedingMaxNominationQuota
      ? true
      : false;

  const continueToSignAndSubmitTx =
    continueToSelectDelegatesStep && continueToAuthorizeTxStep;

  const closeModal = useCallback(() => {
    setIsSubmitAndSignTxLoading(false);
    setIsModalOpen(false);
    setAmountToBond(null);
    setHasAmountToBondError(false);
    setPaymentDestination(PaymentDestination.STAKED);
    setSelectedValidators([]);
    setDelegateTxStep(DelegateTxSteps.BOND_TOKENS);
  }, [setIsModalOpen]);

  const executeDelegate: () => Promise<void> = useCallback(async () => {
    try {
      if (amountToBond === null) {
        throw new Error('There is no amount to bond.');
      }
      const bondingAmount = +formatBnToDisplayAmount(amountToBond);
      if (isFirstTimeNominator) {
        await executeTx(
          () =>
            bondTokensEvm(
              walletAddress,
              bondingAmount,
              PaymentDestination.STASH
            ),
          () =>
            bondTokensSubstrate(
              rpcEndpoint,
              walletAddress,
              bondingAmount,
              PaymentDestination.STASH
            ),
          `Successfully bonded ${bondingAmount} ${nativeTokenSymbol}.`,
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
        if (bondingAmount > 0) {
          await executeTx(
            () => bondExtraTokensEvm(walletAddress, bondingAmount),
            () =>
              bondExtraTokensSubstrate(
                rpcEndpoint,
                walletAddress,
                bondingAmount
              ),
            `Successfully bonded ${bondingAmount} ${nativeTokenSymbol}.`,
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
          `Successfully nominated ${selectedValidators.length} validator(s).`,
          'Failed to nominate validator(s)!'
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
    nativeTokenSymbol,
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
                walletBalance={
                  walletBalance && walletBalance.value1
                    ? walletBalance.value1
                    : BN_ZERO
                }
                paymentDestinationOptions={PAYMENT_DESTINATION_OPTIONS}
                paymentDestination={paymentDestination}
                setPaymentDestination={setPaymentDestination}
                tokenSymbol={nativeTokenSymbol}
                handleAmountToBondError={handleAmountToBondError}
              />
            ) : delegateTxStep === DelegateTxSteps.SELECT_DELEGATES ? (
              <SelectValidators
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
                  : amountToBond !== null && amountToBond.gt(BN_ZERO)
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
