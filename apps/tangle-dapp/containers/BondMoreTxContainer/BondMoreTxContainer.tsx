'use client';

import { BN, BN_ZERO } from '@polkadot/util';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Typography,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { TANGLE_DOCS_STAKING_URL } from '@webb-tools/webb-ui-components/constants';
import { type FC, useCallback, useEffect, useState } from 'react';

import AmountInput from '../../components/AmountInput/AmountInput';
import useTokenWalletFreeBalance from '../../data/NominatorStats/useTokenWalletFreeBalance';
import useBondExtraTx from '../../data/staking/useBondExtraTx';
import { BondMoreTxContainerProps } from './types';

const BondMoreTxContainer: FC<BondMoreTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { notificationApi } = useWebbUI();
  const [amountToBond, setAmountToBond] = useState<BN | null>(null);
  const [isBondMoreTxLoading, setIsBondMoreTxLoading] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);

  const { data: walletBalance, error: walletBalanceError } =
    useTokenWalletFreeBalance();

  useEffect(() => {
    if (walletBalanceError) {
      notificationApi({
        variant: 'error',
        message: walletBalanceError.message,
      });
    }
  }, [notificationApi, walletBalanceError]);

  const handleSetErrorMessage = useCallback(
    (error: string | null) => {
      setHasErrors(error !== null);
    },
    [setHasErrors],
  );

  const closeModalAndReset = useCallback(() => {
    setIsBondMoreTxLoading(false);
    setIsModalOpen(false);
    setAmountToBond(null);
    setHasErrors(false);
  }, [setIsModalOpen]);

  const { execute: executeBondExtraTx } = useBondExtraTx();

  const submitAndSignTx = useCallback(async () => {
    if (executeBondExtraTx === null || amountToBond === null) {
      return;
    }

    setIsBondMoreTxLoading(true);

    try {
      await executeBondExtraTx({
        amount: amountToBond,
      });

      closeModalAndReset();
    } catch {
      setIsBondMoreTxLoading(false);
    }
  }, [executeBondExtraTx, amountToBond, closeModalAndReset]);

  const canSubmitTx =
    amountToBond !== null && amountToBond.gt(BN_ZERO) && !hasErrors;

  return (
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isModalOpen}
        className="w-full max-w-[416px]"
      >
        <ModalHeader onClose={closeModalAndReset}>Add Stake</ModalHeader>

        <div className="space-y-4 p-9">
          <AmountInput
            id="add-stake-input"
            title="Amount"
            max={walletBalance?.value1 ?? undefined}
            amount={amountToBond}
            setAmount={setAmountToBond}
            baseInputOverrides={{ isFullWidth: true }}
            maxErrorMessage="Not enough available balance"
            setErrorMessage={handleSetErrorMessage}
            isDisabled={isBondMoreTxLoading}
          />
          <Typography variant="body1" fw="normal">
            Added stake will be bonded and subject to unbonding period before
            withdrawal is possible.
          </Typography>
        </div>

        <ModalFooter className="flex items-center gap-2">
          <Button
            isFullWidth
            variant="secondary"
            href={TANGLE_DOCS_STAKING_URL}
            target="_blank"
          >
            Learn More
          </Button>

          <Button
            isFullWidth
            isDisabled={!canSubmitTx}
            isLoading={isBondMoreTxLoading}
            onClick={submitAndSignTx}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BondMoreTxContainer;
