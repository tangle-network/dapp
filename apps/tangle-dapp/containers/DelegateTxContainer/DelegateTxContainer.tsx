'use client';

import { BN, BN_ZERO } from '@polkadot/util';
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
import { WEBB_TANGLE_DOCS_STAKING_URL } from '@webb-tools/webb-ui-components/constants';
import { type FC, useCallback, useState } from 'react';

import { TxConfirmationModal } from '../../components/TxConfirmationModal';
import { PAYMENT_DESTINATION_OPTIONS } from '../../constants';
import useNetworkStore from '../../context/useNetworkStore';
import usePaymentDestination from '../../data/NominatorStats/usePaymentDestinationSubscription';
import useTokenWalletFreeBalance from '../../data/NominatorStats/useTokenWalletFreeBalance';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
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
import BondTokens from './BondTokens';
import { DelegateTxContainerProps, DelegateTxSteps } from './types';

const DelegateTxContainer: FC<DelegateTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { notificationApi } = useWebbUI();
  const maxNominationQuota = useMaxNominationQuota();

  const executeTx = useExecuteTxWithNotification();
  const activeSubstrateAddress = useSubstrateAddress();
  const { rpcEndpoint, nativeTokenSymbol } = useNetworkStore();
  const [hasAmountToBondError, setHasAmountToBondError] = useState(false);

  const [amountToBond, setAmountToBond] = useState<BN | null>(null);
  const [selectedValidators, setSelectedValidators] = useState<Set<string>>(
    new Set()
  );

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
    selectedValidators.size > maxNominationQuota;

  const [txStatus, setTxnStatus] = useState<{
    status: 'success' | 'error';
    hash: string;
  }>({
    status: 'error',
    hash: '',
  });

  const currentStep = (() => {
    if (delegateTxStep === DelegateTxSteps.BOND_TOKENS) {
      return '(1/2)';
    } else if (delegateTxStep === DelegateTxSteps.SELECT_DELEGATES) {
      return '(2/2)';
    }
  })();

  const {
    isFirstTimeNominator,
    isLoading: isFirstTimeNominatorLoading,
    isError: isFirstTimeNominatorError,
  } = useIsFirstTimeNominator();

  const walletAddress = useActiveAccountAddress<string>('');
  const { data: walletBalance, error: walletBalanceError } =
    useTokenWalletFreeBalance();

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
      walletAddress.length > 0
    ? true
    : false;

  const continueToAuthorizeTxStep =
    selectedValidators.size > 0 && !isExceedingMaxNominationQuota
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
    setSelectedValidators(new Set());
    setDelegateTxStep(DelegateTxSteps.BOND_TOKENS);
  }, [setIsModalOpen]);

  const executeDelegate: () => Promise<void> = useCallback(async () => {
    try {
      if (amountToBond === null) {
        throw new Error('Amount to bond is required.');
      }

      if (walletAddress.length === 0) {
        throw new Error('Wallet address is required.');
      }

      const bondingAmount = +formatBnToDisplayAmount(amountToBond);
      const selectedValidatorsArr = Array.from(selectedValidators);

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
          () => nominateValidatorsEvm(walletAddress, selectedValidatorsArr),
          () =>
            nominateValidatorsSubstrate(
              rpcEndpoint,
              walletAddress,
              selectedValidatorsArr
            ),
          `Successfully nominated ${selectedValidators.size} validators.`,
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
          () => nominateValidatorsEvm(walletAddress, selectedValidatorsArr),
          () =>
            nominateValidatorsSubstrate(
              rpcEndpoint,
              walletAddress,
              selectedValidatorsArr
            ),
          `Successfully nominated ${selectedValidators.size} validator(s).`,
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
          className="w-full max-w-[838px] rounded-2xl bg-mono-0 dark:bg-mono-180"
        >
          <ModalHeader titleVariant="h4" onClose={closeModal}>
            Setup Nomination {currentStep}
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
              <SelectValidators setSelectedValidators={setSelectedValidators} />
            ) : null}

            {isExceedingMaxNominationQuota && (
              <Alert
                type="error"
                className="mt-4"
                description={`You can only nominate up to ${maxNominationQuota} validators.`}
              />
            )}
          </div>

          <ModalFooter className="flex items-center gap-1">
            {delegateTxStep === DelegateTxSteps.BOND_TOKENS ? (
              <Button
                isFullWidth
                variant="secondary"
                target="_blank"
                href={WEBB_TANGLE_DOCS_STAKING_URL}
              >
                Learn More
              </Button>
            ) : (
              <Button
                isFullWidth
                variant="secondary"
                onClick={() => setDelegateTxStep(DelegateTxSteps.BOND_TOKENS)}
              >
                Back
              </Button>
            )}

            {delegateTxStep === DelegateTxSteps.BOND_TOKENS ? (
              <Button
                variant="primary"
                isFullWidth
                className="!mt-0"
                isDisabled={
                  delegateTxStep === DelegateTxSteps.BOND_TOKENS &&
                  !continueToSelectDelegatesStep
                }
                onClick={() => {
                  if (delegateTxStep === DelegateTxSteps.BOND_TOKENS) {
                    setDelegateTxStep(DelegateTxSteps.SELECT_DELEGATES);
                  }
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="primary"
                isFullWidth
                className="!mt-0"
                isDisabled={
                  delegateTxStep === DelegateTxSteps.SELECT_DELEGATES &&
                  !continueToSignAndSubmitTx
                }
                isLoading={isSubmitAndSignTxLoading}
                onClick={submitAndSignTx}
              >
                Confirm
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
