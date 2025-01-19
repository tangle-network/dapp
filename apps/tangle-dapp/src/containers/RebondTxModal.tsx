import { BN, BN_ZERO } from '@polkadot/util';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { TANGLE_DOCS_STAKING_URL } from '@webb-tools/webb-ui-components/constants';
import { type FC, useCallback, useState } from 'react';

import { BondedTokensBalanceInfo } from '../components';
import AmountInput from '../components/AmountInput';
import useUnbondedAmount from '../data/nomination/useUnbondedAmount';
import useUnbondingAmount from '../data/nomination/useUnbondingAmount';
import useRebondTx from '../data/staking/useRebondTx';
import { TxStatus } from '../hooks/useSubstrateTx';

type Props = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
};

const RebondTxModal: FC<Props> = ({ isModalOpen, setIsModalOpen }) => {
  const [amountToRebond, setAmountToRebond] = useState<BN | null>(null);
  const [hasErrors, setHasErrors] = useState(false);

  const { result: totalUnbondingAmount } = useUnbondingAmount();
  const { result: totalUnbondedAmount } = useUnbondedAmount();
  const { execute: executeRebondTx, status: rebondTxStatus } = useRebondTx();

  const closeModalAndReset = useCallback(() => {
    setIsModalOpen(false);
    setAmountToRebond(null);
    setHasErrors(false);
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

  const handleSetErrorMessage = useCallback(
    (error: string | null) => {
      setHasErrors(error !== null);
    },
    [setHasErrors],
  );

  const submitTx = useCallback(async () => {
    if (
      executeRebondTx === null ||
      amountToRebond === null ||
      amountToRebond.isZero()
    ) {
      return null;
    }

    await executeRebondTx({
      amount: amountToRebond,
    });

    closeModalAndReset();
  }, [executeRebondTx, amountToRebond, closeModalAndReset]);

  const canSubmitTx =
    amountToRebond !== null &&
    amountToRebond.gt(BN_ZERO) &&
    !hasErrors &&
    executeRebondTx !== null;

  return (
    <Modal open={isModalOpen} onOpenChange={handleOpenChange}>
      <ModalContent size="sm">
        <ModalHeader>Rebond Funds</ModalHeader>

        <ModalBody>
          <Typography variant="body1">
            Rebond to return unbonding or unbonded tokens to staking without
            withdrawing.
          </Typography>

          <AmountInput
            id="nomination-rebond-amount"
            title="Amount"
            max={totalUnbondingAmount?.value ?? undefined}
            amount={amountToRebond}
            setAmount={setAmountToRebond}
            wrapperOverrides={{ isFullWidth: true }}
            maxErrorMessage="Not enough unbonding balance"
            setErrorMessage={handleSetErrorMessage}
            isDisabled={rebondTxStatus === TxStatus.PROCESSING}
          />

          <div className="space-y-2">
            <BondedTokensBalanceInfo
              type="unbonded"
              value={totalUnbondedAmount?.value ?? BN_ZERO}
            />

            <BondedTokensBalanceInfo
              type="unbonding"
              value={totalUnbondingAmount?.value ?? BN_ZERO}
            />
          </div>
        </ModalBody>

        <ModalFooterActions
          learnMoreLinkHref={TANGLE_DOCS_STAKING_URL}
          isConfirmDisabled={!canSubmitTx}
          isProcessing={rebondTxStatus === TxStatus.PROCESSING}
          onConfirm={submitTx}
        />
      </ModalContent>
    </Modal>
  );
};

export default RebondTxModal;
