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
} from '@webb-tools/webb-ui-components';
import { WEBB_TANGLE_DOCS_STAKING_URL } from '@webb-tools/webb-ui-components/constants';
import { type FC, useCallback, useState } from 'react';

import { TxConfirmationModal } from '../../components/TxConfirmationModal';
import { PAYMENT_DESTINATION_OPTIONS as PAYEE_OPTIONS } from '../../constants';
import useNetworkStore from '../../context/useNetworkStore';
import usePaymentDestination from '../../data/NominatorStats/usePaymentDestinationSubscription';
import useSetupNominatorTx from '../../data/staking/useSetupNominatorTx';
import useUpdateNominatorTx from '../../data/staking/useUpdateNominatorTx';
import useIsBondedOrNominating from '../../hooks/useIsBondedOrNominating';
import useMaxNominationQuota from '../../hooks/useMaxNominationQuota';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import { StakingRewardsDestination } from '../../types';
import SelectValidators from '../UpdateNominationsTxContainer/SelectValidators';
import BondTokens from './BondTokens';
import { DelegateTxContainerProps, DelegateTxSteps } from './types';

const DelegateTxContainer: FC<DelegateTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { activeAccount } = useWebContext();
  const maxNominationQuota = useMaxNominationQuota();
  const [amountToBond, setAmountToBond] = useState<BN | null>(null);
  const [selectedValidators, setSelectedValidators] = useState<string[]>([]);
  const activeSubstrateAddress = useSubstrateAddress();
  const { nativeTokenSymbol } = useNetworkStore();
  const [payee, setPayee] = useState(StakingRewardsDestination.STAKED);
  const [hasAmountToBondError, setHasAmountToBondError] = useState(false);

  const [txConfirmationModalIsOpen, setTxnConfirmationModalIsOpen] =
    useState(false);

  const [delegateTxStep, setDelegateTxStep] = useState(
    DelegateTxSteps.BOND_TOKENS
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
    switch (delegateTxStep) {
      case DelegateTxSteps.BOND_TOKENS:
        return '(1/2)';
      case DelegateTxSteps.SELECT_DELEGATES:
        return '(2/2)';
    }
  })();

  const walletAddress = (() => {
    if (!activeAccount?.address) {
      return '0x0';
    }

    return activeAccount.address;
  })();

  const {
    isBondedOrNominating,
    isLoading: isBondedOrNominatingLoading,
    isError: isBondedOrNominatingError,
  } = useIsBondedOrNominating();

  // TODO: Need to change defaulting to empty/dummy strings to instead adhere to the type system. Ex. should be using `| null` instead.
  const { data: currentPaymentDestination } = usePaymentDestination(
    activeSubstrateAddress ?? '0x0'
  );

  const handleAmountToBondError = useCallback(
    (error: string | null) => {
      setHasAmountToBondError(error !== null);
    },
    [setHasAmountToBondError]
  );

  const closeModalAndReset = useCallback(() => {
    setIsSubmitAndSignTxLoading(false);
    setIsModalOpen(false);
    setPayee(StakingRewardsDestination.STAKED);
    setAmountToBond(null);
    setHasAmountToBondError(false);
    setSelectedValidators([]);
    setDelegateTxStep(DelegateTxSteps.BOND_TOKENS);
  }, [setIsModalOpen]);

  const { execute: executeSetupNominatorTx } = useSetupNominatorTx();
  const { execute: executeUpdateNominatorTx } = useUpdateNominatorTx();

  const executeDelegate2 = useCallback(async () => {
    // Not yet ready.
    if (
      isBondedOrNominating === null ||
      executeSetupNominatorTx === null ||
      executeUpdateNominatorTx === null ||
      amountToBond === null
    ) {
      return;
    }

    // Setting up a new nominator.
    if (!isBondedOrNominating) {
      await executeSetupNominatorTx({
        bondAmount: amountToBond,
        payee,
        nominees: selectedValidators,
      });
    }
    // Increasing bond, changing payee, nominating new validators,
    // or a combination of the three.
    else {
      // Only bond extra if the amount is greater than zero, and
      // if the user provided an amount to bond.
      const extraBondingAmount =
        amountToBond.isZero() || amountToBond === null
          ? undefined
          : amountToBond;

      const currentPayee =
        currentPaymentDestination?.value1 === 'Staked'
          ? StakingRewardsDestination.STAKED
          : StakingRewardsDestination.STASH;

      // Update the payee if it has changed.
      const newPayee = currentPayee === payee ? undefined : payee;

      await executeUpdateNominatorTx({
        bondAmount: extraBondingAmount,
        payee: newPayee,
        // TODO: Only update nominees if they have changed. Use `_.isEqual` or similar to compare arrays.
        nominees: selectedValidators,
      });
    }
  }, [
    amountToBond,
    currentPaymentDestination?.value1,
    executeSetupNominatorTx,
    executeUpdateNominatorTx,
    isBondedOrNominating,
    payee,
    selectedValidators,
  ]);

  const submitTx = useCallback(async () => {
    setIsSubmitAndSignTxLoading(true);

    try {
      await executeDelegate2();
      closeModalAndReset();
    } catch (error) {
      console.error(error);

      // notification is already handled in executeTx
    }
  }, [closeModalAndReset, executeDelegate2]);

  if (
    isBondedOrNominating == null ||
    isBondedOrNominatingLoading ||
    isBondedOrNominatingError
  ) {
    return null;
  }

  const canContinueToSelectDelegatesStep = !isBondedOrNominating
    ? amountToBond !== null && amountToBond.gt(BN_ZERO)
    : true && !hasAmountToBondError && payee && walletAddress !== '0x0'
    ? true
    : false;

  const canContinueToAuthorizeTxStep =
    selectedValidators.length > 0 && !isExceedingMaxNominationQuota
      ? true
      : false;

  const canContinueToSignAndSubmitTx =
    canContinueToSelectDelegatesStep && canContinueToAuthorizeTxStep;

  return (
    <>
      <Modal open>
        <ModalContent
          isCenter
          isOpen={isModalOpen}
          className="w-full max-w-[838px] rounded-2xl bg-mono-0 dark:bg-mono-180"
        >
          <ModalHeader titleVariant="h4" onClose={closeModalAndReset}>
            Setup Nomination {currentStep}
          </ModalHeader>

          <div className="px-8 py-6">
            {delegateTxStep === DelegateTxSteps.BOND_TOKENS ? (
              <BondTokens
                isBondedOrNominating={isBondedOrNominating}
                nominatorAddress={walletAddress}
                amountToBond={amountToBond}
                setAmountToBond={setAmountToBond}
                payeeOptions={PAYEE_OPTIONS}
                payee={payee}
                setPayee={setPayee}
                tokenSymbol={nativeTokenSymbol}
                handleAmountToBondError={handleAmountToBondError}
              />
            ) : delegateTxStep === DelegateTxSteps.SELECT_DELEGATES ? (
              <SelectValidators
                selectedValidators={selectedValidators}
                setSelectedValidators={setSelectedValidators}
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

          <ModalFooter className="flex gap-1 items-center">
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
                  !canContinueToSelectDelegatesStep
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
                  !canContinueToSignAndSubmitTx
                }
                isLoading={isSubmitAndSignTxLoading}
                onClick={submitTx}
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
