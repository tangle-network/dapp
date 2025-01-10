import { BN, BN_ZERO } from '@polkadot/util';
import {
  Caption,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { TANGLE_DOCS_STAKING_URL } from '@webb-tools/webb-ui-components/constants';
import { type FC, useCallback, useEffect, useState } from 'react';

import AmountInput from '../../components/AmountInput';
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

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setIsModalOpen(open);
      } else {
        closeModalAndReset();
      }
    },
    [closeModalAndReset, setIsModalOpen],
  );

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
    <Modal open={isModalOpen} onOpenChange={handleOpenChange}>
      <ModalContent size="sm">
        <ModalHeader>Add Stake</ModalHeader>

        <ModalBody className="gap-3">
          <AmountInput
            id="add-stake-input"
            title="Amount"
            max={walletBalance?.value1 ?? undefined}
            amount={amountToBond}
            setAmount={setAmountToBond}
            wrapperOverrides={{ isFullWidth: true }}
            maxErrorMessage="Not enough available balance"
            setErrorMessage={handleSetErrorMessage}
            isDisabled={isBondMoreTxLoading}
          />

          <Caption>
            Added stake will be bonded and subject to unbonding period before
            withdrawal is possible.
          </Caption>
        </ModalBody>

        <ModalFooterActions
          learnMoreLinkHref={TANGLE_DOCS_STAKING_URL}
          isConfirmDisabled={!canSubmitTx}
          isProcessing={isBondMoreTxLoading}
          onConfirm={submitAndSignTx}
        />
      </ModalContent>
    </Modal>
  );
};

export default BondMoreTxContainer;
