'use client';

import { BN, BN_ZERO } from '@polkadot/util';
import {
  Alert,
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@webb-tools/webb-ui-components';
import { WEBB_TANGLE_DOCS_STAKING_URL } from '@webb-tools/webb-ui-components/constants';
import assert from 'assert';
import { type FC, useCallback, useState } from 'react';

import { PAYMENT_DESTINATION_OPTIONS as PAYEE_OPTIONS } from '../../constants';
import useNetworkStore from '../../context/useNetworkStore';
import useStakingRewardsDestination from '../../data/NominatorStats/useStakingRewardsDestination';
import useIsBondedOrNominating from '../../data/staking/useIsBondedOrNominating';
import useSetupNominatorTx from '../../data/staking/useSetupNominatorTx';
import useUpdateNominatorTx from '../../data/staking/useUpdateNominatorTx';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import useMaxNominationQuota from '../../hooks/useMaxNominationQuota';
import { TxStatus } from '../../hooks/useSubstrateTx';
import { StakingRewardsDestination } from '../../types';
import SelectValidators from '../UpdateNominationsTxContainer/SelectValidators';
import BondTokens from './BondTokens';
import { DelegateTxContainerProps, DelegateTxSteps } from './types';

const DelegateTxContainer: FC<DelegateTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const maxNominationQuota = useMaxNominationQuota();
  const [amountToBond, setAmountToBond] = useState<BN | null>(null);
  const [selectedValidators, setSelectedValidators] = useState<string[]>([]);
  const { nativeTokenSymbol } = useNetworkStore();
  const [payee, setPayee] = useState(StakingRewardsDestination.STAKED);
  const [hasAmountToBondError, setHasAmountToBondError] = useState(false);
  const activeAccountAddress = useActiveAccountAddress();

  const [delegateTxStep, setDelegateTxStep] = useState(
    DelegateTxSteps.BOND_TOKENS
  );

  const isExceedingMaxNominationQuota =
    selectedValidators.length > maxNominationQuota;

  const currentStep = (() => {
    switch (delegateTxStep) {
      case DelegateTxSteps.BOND_TOKENS:
        return '(1/2)';
      case DelegateTxSteps.SELECT_DELEGATES:
        return '(2/2)';
    }
  })();

  const isBondedOrNominating = useIsBondedOrNominating();
  const { result: currentPayeeOpt } = useStakingRewardsDestination();

  const handleAmountToBondError = useCallback(
    (error: string | null) => {
      setHasAmountToBondError(error !== null);
    },
    [setHasAmountToBondError]
  );

  const closeModalAndReset = useCallback(() => {
    setIsModalOpen(false);
    setPayee(StakingRewardsDestination.STAKED);
    setAmountToBond(null);
    setHasAmountToBondError(false);
    setSelectedValidators([]);
    setDelegateTxStep(DelegateTxSteps.BOND_TOKENS);
  }, [setIsModalOpen]);

  const { execute: executeSetupNominatorTx, status: setupNominatorTxStatus } =
    useSetupNominatorTx();

  const { execute: executeUpdateNominatorTx, status: updateNominatorTxStatus } =
    useUpdateNominatorTx();

  const executeDelegateTx = useCallback(async () => {
    // Not yet ready.
    if (
      isBondedOrNominating === null ||
      executeSetupNominatorTx === null
      // executeUpdateNominatorTx === null
    ) {
      return;
    }

    // Setting up a new nominator.
    if (!isBondedOrNominating) {
      assert(
        amountToBond !== null,
        'Amount to bond should be set if setting up a nominator'
      );

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
        amountToBond === null || amountToBond.isZero()
          ? undefined
          : amountToBond;

      // Update the payee if it has changed.
      const newPayee = currentPayeeOpt?.value === payee ? undefined : payee;

      // await executeUpdateNominatorTx({
      //   bondAmount: extraBondingAmount,
      //   payee: newPayee,
      //   // TODO: Only update nominees if they have changed. Use `_.isEqual` or similar to compare arrays.
      //   nominees: selectedValidators,
      // });
    }
  }, [
    amountToBond,
    currentPayeeOpt,
    executeSetupNominatorTx,
    isBondedOrNominating,
    payee,
    selectedValidators,
  ]);

  const submitTx = useCallback(async () => {
    await executeDelegateTx();
    closeModalAndReset();
  }, [closeModalAndReset, executeDelegateTx]);

  if (isBondedOrNominating == null) {
    return null;
  }

  const canContinueToSelectDelegatesStep = isBondedOrNominating
    ? !hasAmountToBondError && activeAccountAddress !== null
    : amountToBond !== null && amountToBond.gt(BN_ZERO);

  const canContinueToAuthorizeTxStep =
    selectedValidators.length > 0 && !isExceedingMaxNominationQuota
      ? true
      : false;

  const canContinueToSubmitTx =
    canContinueToSelectDelegatesStep && canContinueToAuthorizeTxStep;

  return (
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
              // TODO: Don't default to a random address in order to satisfy to the type system. Handle the `null` case explicitly.
              nominatorAddress={activeAccountAddress ?? '0x0'}
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
              onClick={submitTx}
              isDisabled={
                delegateTxStep === DelegateTxSteps.SELECT_DELEGATES &&
                !canContinueToSubmitTx
              }
              isLoading={
                setupNominatorTxStatus === TxStatus.PROCESSING ||
                updateNominatorTxStatus === TxStatus.PROCESSING
              }
            >
              Confirm
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DelegateTxContainer;
