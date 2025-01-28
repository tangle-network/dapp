import { BN, BN_ZERO } from '@polkadot/util';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
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
import { type FC, useCallback, useMemo, useState } from 'react';

import AmountInput from '../components/AmountInput';
import useTotalStakedAmountSubscription from '../data/nomination/useTotalStakedAmountSubscription';
import useUnbondingAmount from '../data/nomination/useUnbondingAmount';
import useUnbondTx from '../data/staking/useUnbondTx';
import { TxStatus } from '../hooks/useSubstrateTx';

export type Props = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
};

const UnbondTxModal: FC<Props> = ({ isModalOpen, setIsModalOpen }) => {
  const [amount, setAmount] = useState<BN | null>(null);
  const [hasErrors, setHasErrors] = useState(false);

  const { notificationApi } = useWebbUI();
  const { nativeTokenSymbol } = useNetworkStore();
  const { execute: executeUnbondTx, status: unbondTxStatus } = useUnbondTx();

  const { data: totalStakedBalanceData, error: totalStakedBalanceError } =
    useTotalStakedAmountSubscription();

  const { result: unbondingAmount, error: unbondingAmountError } =
    useUnbondingAmount();

  const totalStakedBalance = useMemo(() => {
    if (totalStakedBalanceError) {
      notificationApi({
        variant: 'error',
        message: totalStakedBalanceError.message,
      });
    }

    if (!totalStakedBalanceData?.value1) {
      return BN_ZERO;
    }

    return totalStakedBalanceData.value1;
  }, [
    notificationApi,
    totalStakedBalanceData?.value1,
    totalStakedBalanceError,
  ]);

  const remainingStakedBalanceToUnbond = useMemo(() => {
    if (unbondingAmountError) {
      notificationApi({
        variant: 'error',
        message: unbondingAmountError.message,
      });
    }

    if (unbondingAmount === null || unbondingAmount.value === null) {
      return undefined;
    }

    return totalStakedBalance.sub(unbondingAmount.value);
  }, [
    notificationApi,
    totalStakedBalance,
    unbondingAmount,
    unbondingAmountError,
  ]);

  const canSubmitTx =
    amount !== null &&
    amount.gt(BN_ZERO) &&
    executeUnbondTx !== null &&
    !hasErrors;

  const closeModalAndReset = useCallback(() => {
    setIsModalOpen(false);
    setAmount(null);
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
    if (executeUnbondTx === null || amount === null) {
      return;
    }

    await executeUnbondTx({
      amount: amount,
    });

    closeModalAndReset();
  }, [amount, closeModalAndReset, executeUnbondTx]);

  return (
    <Modal open={isModalOpen} onOpenChange={handleOpenChange}>
      <ModalContent size="sm">
        <ModalHeader>Unbond Stake</ModalHeader>

        <ModalBody>
          <AmountInput
            id="unbond-input"
            title="Amount"
            max={remainingStakedBalanceToUnbond}
            amount={amount}
            setAmount={setAmount}
            wrapperOverrides={{ isFullWidth: true }}
            maxErrorMessage="Not enough staked balance"
            setErrorMessage={handleSetErrorMessage}
            isDisabled={unbondTxStatus === TxStatus.PROCESSING}
          />

          <Caption>
            Once unbonding, you must wait certain number of eras for your funds
            to become available.
          </Caption>

          <Caption>
            You can check the remaining eras for your funds to become available
            in the Unbonding {nativeTokenSymbol} tooltip.
          </Caption>
        </ModalBody>

        <ModalFooterActions
          learnMoreLinkHref={TANGLE_DOCS_STAKING_URL}
          isProcessing={unbondTxStatus === TxStatus.PROCESSING}
          isConfirmDisabled={!canSubmitTx}
          onConfirm={submitTx}
        />
      </ModalContent>
    </Modal>
  );
};

export default UnbondTxModal;
