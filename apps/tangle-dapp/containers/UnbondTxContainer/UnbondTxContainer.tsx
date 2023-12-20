'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import { isViemError } from '@webb-tools/web3-api-provider';
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

import { evmPublicClient, unBondTokens } from '../../constants';
import useTotalStakedAmountSubscription from '../../data/NominatorStats/useTotalStakedAmountSubscription';
import useUnbondingAmountSubscription from '../../data/NominatorStats/useUnbondingAmountSubscription';
import {
  convertEthereumToSubstrateAddress,
  splitTokenValueAndSymbol,
} from '../../utils';
import { UnbondTxContainerProps } from './types';
import UnbondTokens from './UnbondTokens';

const UnbondTxContainer: FC<UnbondTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { notificationApi } = useWebbUI();
  const { activeAccount } = useWebContext();

  const [amountToUnbond, setAmountToUnbond] = useState<number>(0);
  const [isUnbondTxLoading, setIsUnbondTxLoading] = useState<boolean>(false);

  const walletAddress = useMemo(() => {
    if (!activeAccount?.address) return '0x0';

    return activeAccount.address;
  }, [activeAccount?.address]);

  const substrateAddress = useMemo(() => {
    if (!activeAccount?.address) return '';

    return convertEthereumToSubstrateAddress(activeAccount.address);
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
      return 'You have unbonded all your staked tTNT!';
    } else if (amountToUnbond > remainingStakedBalanceToUnbond) {
      return `You can only unbond ${remainingStakedBalanceToUnbond} tTNT!`;
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
      const bondExtraTokensTxHash = await unBondTokens(
        walletAddress,
        amountToUnbond
      );

      if (!bondExtraTokensTxHash) {
        throw new Error('Failed to unbond tokens!');
      }

      const bondExtraTokensTx = await evmPublicClient.waitForTransactionReceipt(
        {
          hash: bondExtraTokensTxHash,
        }
      );

      if (bondExtraTokensTx.status !== 'success') {
        throw new Error('Failed to unbond tokens!');
      }

      notificationApi({
        variant: 'success',
        message: `Successfully unbonded ${amountToUnbond} tTNT.`,
      });
    } catch (error: any) {
      notificationApi({
        variant: 'error',
        message: isViemError(error)
          ? error.shortMessage
          : error.message || 'Something went wrong!',
      });
    } finally {
      closeModal();
    }
  }, [amountToUnbond, closeModal, notificationApi, walletAddress]);

  return (
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isModalOpen}
        className="w-full max-w-[500px] rounded-2xl bg-mono-0 dark:bg-mono-180"
      >
        <ModalHeader titleVariant="h4" onClose={closeModal}>
          Unbond Stake
        </ModalHeader>

        <div className="px-8 py-6">
          <UnbondTokens
            nominatorAddress={walletAddress}
            amountToUnbond={amountToUnbond}
            setAmountToUnbond={setAmountToUnbond}
            amountToUnbondError={amountToUnbondError}
            totalStakedBalance={totalStakedBalance}
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
            Sign & Submit
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
