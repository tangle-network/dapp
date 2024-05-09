'use client';

import { BN, BN_ZERO } from '@polkadot/util';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { WEBB_TANGLE_DOCS_STAKING_URL } from '@webb-tools/webb-ui-components/constants';
import Link from 'next/link';
import { type FC, useCallback, useState } from 'react';

import { BondedTokensBalanceInfo } from '../../components';
import AmountInput from '../../components/AmountInput/AmountInput';
import useUnbondedAmount from '../../data/NominatorStats/useUnbondedAmount';
import useUnbondingAmount from '../../data/NominatorStats/useUnbondingAmount';
import useRebondTx from '../../data/staking/useRebondTx';
import { TxStatus } from '../../hooks/useSubstrateTx';
import { RebondTxContainerProps } from './types';

const RebondTxContainer: FC<RebondTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
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

  const handleSetErrorMessage = useCallback(
    (error: string | null) => {
      setHasErrors(error !== null);
    },
    [setHasErrors]
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
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isModalOpen}
        className="w-full max-w-[416px] rounded-2xl bg-mono-0 dark:bg-mono-180"
      >
        <ModalHeader titleVariant="h4" onClose={closeModalAndReset}>
          Rebond Funds
        </ModalHeader>

        <div className="space-y-4 p-9">
          <Typography variant="body1" fw="normal">
            Rebond to return unbonding or unbonded tokens to staking without
            withdrawing.
          </Typography>

          <AmountInput
            id="rebond-input"
            title="Amount"
            max={totalUnbondingAmount?.value ?? undefined}
            amount={amountToRebond}
            setAmount={setAmountToRebond}
            baseInputOverrides={{ isFullWidth: true }}
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
        </div>

        <ModalFooter className="flex flex-col gap-1 px-8 py-6">
          <Button
            isFullWidth
            isDisabled={!canSubmitTx}
            isLoading={rebondTxStatus === TxStatus.PROCESSING}
            onClick={submitTx}
          >
            Confirm
          </Button>

          <Link href={WEBB_TANGLE_DOCS_STAKING_URL} target="_blank">
            <Button isFullWidth variant="secondary">
              Learn More
            </Button>
          </Link>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RebondTxContainer;
