'use client';

import { BN, BN_ZERO } from '@polkadot/util';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { isSubstrateAddress } from '@webb-tools/dapp-types';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Typography,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { WEBB_TANGLE_DOCS_STAKING_URL } from '@webb-tools/webb-ui-components/constants';
import Link from 'next/link';
import { type FC, useCallback, useMemo, useState } from 'react';

import AmountInput from '../../components/AmountInput/AmountInput';
import useNetworkStore from '../../context/useNetworkStore';
import useTotalStakedAmountSubscription from '../../data/NominatorStats/useTotalStakedAmountSubscription';
import useUnbondingAmount from '../../data/NominatorStats/useUnbondingAmount';
import useUnbondTx from '../../data/staking/useUnbondTx';
import { TxStatus } from '../../hooks/useSubstrateTx';
import { toSubstrateAddress } from '../../utils';
import { UnbondTxContainerProps } from './types';

const UnbondTxContainer: FC<UnbondTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const [amount, setAmount] = useState<BN | null>(null);
  const [hasErrors, setHasErrors] = useState(false);

  const { notificationApi } = useWebbUI();
  const { activeAccount } = useWebContext();
  const { nativeTokenSymbol } = useNetworkStore();
  const { execute: executeUnbondTx, status: unbondTxStatus } = useUnbondTx();

  const substrateAddress = useMemo(() => {
    if (!activeAccount?.address) {
      return '';
    } else if (isSubstrateAddress(activeAccount?.address)) {
      return activeAccount.address;
    }

    return toSubstrateAddress(activeAccount.address) ?? '';
  }, [activeAccount?.address]);

  const { data: totalStakedBalanceData, error: totalStakedBalanceError } =
    useTotalStakedAmountSubscription(substrateAddress);

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

  const handleSetErrorMessage = useCallback(
    (error: string | null) => {
      setHasErrors(error !== null);
    },
    [setHasErrors]
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
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isModalOpen}
        className="w-full max-w-[416px] rounded-2xl bg-mono-0 dark:bg-mono-180"
      >
        <ModalHeader titleVariant="h4" onClose={closeModalAndReset}>
          Unbond Stake
        </ModalHeader>

        <div className="p-9 space-y-4">
          <AmountInput
            id="unbond-input"
            title="Amount"
            max={remainingStakedBalanceToUnbond}
            amount={amount}
            setAmount={setAmount}
            baseInputOverrides={{ isFullWidth: true }}
            maxErrorMessage="Not enough staked balance"
            setErrorMessage={handleSetErrorMessage}
            isDisabled={unbondTxStatus === TxStatus.PROCESSING}
          />
          <Typography variant="body1" fw="normal">
            Once unbonding, you must wait certain number of eras for your funds
            to become available.
          </Typography>

          <Typography variant="body1" fw="normal">
            You can check the remaining eras for your funds to become available
            in the Unbonding {nativeTokenSymbol} tooltip.
          </Typography>
        </div>

        <ModalFooter className="px-8 py-6 flex flex-col gap-1">
          <Button
            isFullWidth
            isDisabled={!canSubmitTx}
            isLoading={unbondTxStatus === TxStatus.PROCESSING}
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

export default UnbondTxContainer;
