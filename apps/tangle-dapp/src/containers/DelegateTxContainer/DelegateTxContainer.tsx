import { BN, BN_ZERO } from '@polkadot/util';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import {
  Alert,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@tangle-network/ui-components';
import { TANGLE_DOCS_STAKING_URL } from '@tangle-network/ui-components/constants';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import assert from 'assert';
import { type FC, useCallback, useState } from 'react';

import { PAYMENT_DESTINATION_OPTIONS as PAYEE_OPTIONS } from '../../constants';
import useStakingRewardsDestination from '../../data/nomination/useStakingRewardsDestination';
import useIsBondedOrNominating from '../../data/staking/useIsBondedOrNominating';
import useSetupNominatorTx from '../../data/staking/useSetupNominatorTx';
import useUpdateNominatorTx from '../../data/staking/useUpdateNominatorTx';
import useActiveAccountAddress from '@tangle-network/tangle-shared-ui/hooks/useActiveAccountAddress';
import useMaxNominationQuota from '../../hooks/useMaxNominationQuota';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
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
  const [selectedValidators, setSelectedValidators] = useState<
    Set<SubstrateAddress>
  >(new Set());
  const { nativeTokenSymbol } = useNetworkStore();
  const [payee, setPayee] = useState(StakingRewardsDestination.STAKED);
  const [hasAmountToBondError, setHasAmountToBondError] = useState(false);
  const activeAccountAddress = useActiveAccountAddress();

  const [delegateTxStep, setDelegateTxStep] = useState(
    DelegateTxSteps.BOND_TOKENS,
  );

  const isExceedingMaxNominationQuota =
    selectedValidators.size > maxNominationQuota;

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
    [setHasAmountToBondError],
  );

  const closeModalAndReset = useCallback(() => {
    setIsModalOpen(false);
    setPayee(StakingRewardsDestination.STAKED);
    setAmountToBond(null);
    setHasAmountToBondError(false);
    setSelectedValidators(new Set());
    setDelegateTxStep(DelegateTxSteps.BOND_TOKENS);
  }, [setIsModalOpen]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setIsModalOpen(true);
      } else {
        closeModalAndReset();
      }
    },
    [closeModalAndReset, setIsModalOpen],
  );

  const { execute: executeSetupNominatorTx, status: setupNominatorTxStatus } =
    useSetupNominatorTx();

  const { execute: executeUpdateNominatorTx, status: updateNominatorTxStatus } =
    useUpdateNominatorTx();

  const executeDelegateTx = useCallback(async () => {
    // Not yet ready.
    if (
      isBondedOrNominating === null ||
      executeSetupNominatorTx === null ||
      executeUpdateNominatorTx === null
    ) {
      return;
    }

    // Setting up a new nominator.
    if (!isBondedOrNominating) {
      assert(
        amountToBond !== null,
        'Amount to bond should be set if setting up a nominator',
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

      await executeUpdateNominatorTx({
        bondAmount: extraBondingAmount,
        payee: newPayee,
        // TODO: Only update nominees if they have changed. Use `_.isEqual` or similar to compare arrays.
        nominees: selectedValidators,
      });
    }
  }, [
    amountToBond,
    currentPayeeOpt?.value,
    executeSetupNominatorTx,
    executeUpdateNominatorTx,
    isBondedOrNominating,
    payee,
    selectedValidators,
  ]);

  const submitTx = useCallback(async () => {
    await executeDelegateTx();

    // TODO: This will close the modal even if the transaction fails. Find a way to keep it open if it fails, and only close it if it succeeds.
    closeModalAndReset();
  }, [closeModalAndReset, executeDelegateTx]);

  if (isBondedOrNominating == null) {
    return null;
  }

  const canContinueToSelectDelegatesStep = isBondedOrNominating
    ? !hasAmountToBondError && activeAccountAddress !== null
    : amountToBond !== null && amountToBond.gt(BN_ZERO);

  const canContinueToAuthorizeTxStep =
    selectedValidators.size > 0 && !isExceedingMaxNominationQuota
      ? true
      : false;

  const canContinueToSubmitTx =
    canContinueToSelectDelegatesStep && canContinueToAuthorizeTxStep;

  return (
    <Modal open={isModalOpen} onOpenChange={handleOpenChange}>
      <ModalContent size="lg">
        <ModalHeader>Setup Nomination {currentStep}</ModalHeader>

        <ModalBody>
          {delegateTxStep === DelegateTxSteps.BOND_TOKENS ? (
            <BondTokens
              isBondedOrNominating={isBondedOrNominating}
              amountToBond={amountToBond}
              setAmountToBond={setAmountToBond}
              payeeOptions={PAYEE_OPTIONS}
              payee={payee}
              setPayee={setPayee}
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
              description={`You can only nominate up to ${maxNominationQuota} ${pluralize('validator', maxNominationQuota !== 1)}.`}
            />
          )}
        </ModalBody>

        <ModalFooter className="flex items-center gap-2">
          {delegateTxStep === DelegateTxSteps.BOND_TOKENS ? (
            <Button
              isFullWidth
              variant="secondary"
              target="_blank"
              href={TANGLE_DOCS_STAKING_URL}
            >
              Learn More
            </Button>
          ) : (
            <Button
              isFullWidth
              variant="secondary"
              isDisabled={setupNominatorTxStatus === TxStatus.PROCESSING}
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
