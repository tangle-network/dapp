'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { WEBB_TANGLE_DOCS_STAKING_URL } from '@webb-tools/webb-ui-components/constants';
import Link from 'next/link';
import { type FC, useCallback, useMemo, useState } from 'react';

import { TANGLE_TOKEN_UNIT } from '../../constants';
import useTotalStakedAmountSubscription from '../../data/NominatorStats/useTotalStakedAmountSubscription';
import useUnbondingAmountSubscription from '../../data/NominatorStats/useUnbondingAmountSubscription';
import useExecuteTxWithNotification from '../../hooks/useExecuteTxWithNotification';
import {
  convertToSubstrateAddress,
  splitTokenValueAndSymbol,
} from '../../utils';
import { unBondTokens as unbondTokensEvm } from '../../utils/evm';
import { unbondTokens as unbondTokensSubstrate } from '../../utils/polkadot';
import { UnbondTxContainerProps } from './types';
import UnbondTokens from './UnbondTokens';

const UnbondTxContainer: FC<UnbondTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { notificationApi } = useWebbUI();
  const { activeAccount } = useWebContext();
  const executeTx = useExecuteTxWithNotification();

  const [amountToUnbond, setAmountToUnbond] = useState<number>(0);
  const [isUnbondTxLoading, setIsUnbondTxLoading] = useState<boolean>(false);

  const walletAddress = useMemo(() => {
    if (!activeAccount?.address) return '0x0';

    return activeAccount.address;
  }, [activeAccount?.address]);

  const substrateAddress = useMemo(() => {
    if (!activeAccount?.address) return '';

    return convertToSubstrateAddress(activeAccount.address);
  }, [activeAccount?.address]);

  const { data: totalStakedBalanceData, error: totalStakedBalanceError } =
    useTotalStakedAmountSubscription(substrateAddress);

  const { data: unbondingAmountData, error: unbondingAmountError } =
    useUnbondingAmountSubscription(substrateAddress);

  const totalStakedBalance = useMemo(() => {
    if (totalStakedBalanceError) {
      notificationApi({
        variant: 'error',
        message: totalStakedBalanceError.message,
      });
    }

    if (!totalStakedBalanceData?.value1) return 0;

    const { value: value_ } = splitTokenValueAndSymbol(
      String(totalStakedBalanceData.value1)
    );

    return value_;
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

    if (!unbondingAmountData?.value1) return 0;

    const { value: value_ } = splitTokenValueAndSymbol(
      String(unbondingAmountData?.value1)
    );

    return totalStakedBalance - value_;
  }, [
    notificationApi,
    totalStakedBalance,
    unbondingAmountData?.value1,
    unbondingAmountError,
  ]);

  const amountToUnbondError = useMemo(() => {
    if (remainingStakedBalanceToUnbond === 0) {
      return `You have unbonded all your staked ${TANGLE_TOKEN_UNIT}!`;
    } else if (amountToUnbond > remainingStakedBalanceToUnbond) {
      return `You can only unbond ${remainingStakedBalanceToUnbond} ${TANGLE_TOKEN_UNIT}!`;
    }
  }, [remainingStakedBalanceToUnbond, amountToUnbond]);

  const continueToSignAndSubmitTx = useMemo(() => {
    return amountToUnbond > 0 && !amountToUnbondError && walletAddress !== '0x0'
      ? true
      : false;
  }, [amountToUnbond, amountToUnbondError, walletAddress]);

  const closeModal = useCallback(() => {
    setIsUnbondTxLoading(false);
    setIsModalOpen(false);
    setAmountToUnbond(0);
  }, [setIsModalOpen]);

  const submitAndSignTx = useCallback(async () => {
    setIsUnbondTxLoading(true);

    try {
      await executeTx(
        () => unbondTokensEvm(walletAddress, amountToUnbond),
        () => unbondTokensSubstrate(walletAddress, amountToUnbond),
        `Successfully unbonded ${amountToUnbond} ${TANGLE_TOKEN_UNIT}.`,
        'Failed to unbond tokens!'
      );
    } catch {
      // notification is already handled in executeTx
    } finally {
      closeModal();
    }
  }, [amountToUnbond, closeModal, executeTx, walletAddress]);

  return (
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isModalOpen}
        className="w-full max-w-[416px] rounded-2xl bg-mono-0 dark:bg-mono-180"
      >
        <ModalHeader titleVariant="h4" onClose={closeModal}>
          Unbond Stake
        </ModalHeader>

        <div className="p-9">
          <UnbondTokens
            amountToUnbond={amountToUnbond}
            setAmountToUnbond={setAmountToUnbond}
            amountToUnbondError={amountToUnbondError}
            remainingStakedBalanceToUnbond={remainingStakedBalanceToUnbond}
          />
        </div>

        <ModalFooter className="px-8 py-6 flex flex-col gap-1">
          <Button
            isFullWidth
            isDisabled={!continueToSignAndSubmitTx}
            isLoading={isUnbondTxLoading}
            onClick={submitAndSignTx}
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
