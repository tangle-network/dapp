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
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';

import { bondExtraTokens, evmPublicClient } from '../../constants';
import useTokenWalletBalance from '../../data/NominatorStats/useTokenWalletBalance';
import BondTokens from './BondTokens';
import { BondMoreTxContainerProps } from './types';

const BondMoreTxContainer: FC<BondMoreTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { notificationApi } = useWebbUI();
  const { activeAccount } = useWebContext();

  const [amountToBond, setAmountToBond] = useState<number>(0);
  const [isBondMoreTxLoading, setIsBondMoreTxLoading] =
    useState<boolean>(false);

  const walletAddress = useMemo(() => {
    if (!activeAccount?.address) return '0x0';

    return activeAccount.address;
  }, [activeAccount?.address]);

  const { data: walletBalance, error: walletBalanceError } =
    useTokenWalletBalance(walletAddress);

  useEffect(() => {
    if (walletBalanceError) {
      notificationApi({
        variant: 'error',
        message: walletBalanceError.message,
      });
    }
  }, [notificationApi, walletBalanceError]);

  const amountToBondError = useMemo(() => {
    if (!walletBalance) return '';

    if (Number(walletBalance.value1) === 0) {
      return 'You have zero tTNT in your wallet!';
    } else if (Number(walletBalance.value1) < amountToBond) {
      return `You don't have enough tTNT in your wallet!`;
    }
  }, [walletBalance, amountToBond]);

  const continueToSignAndSubmitTx = useMemo(() => {
    return amountToBond > 0 && !amountToBondError && walletAddress !== '0x0'
      ? true
      : false;
  }, [amountToBond, amountToBondError, walletAddress]);

  const closeModal = useCallback(() => {
    setIsBondMoreTxLoading(false);
    setIsModalOpen(false);
    setAmountToBond(0);
  }, [setIsModalOpen]);

  const submitAndSignTx = useCallback(async () => {
    setIsBondMoreTxLoading(true);

    try {
      const bondExtraTokensTxHash = await bondExtraTokens(
        walletAddress,
        amountToBond
      );

      if (!bondExtraTokensTxHash) {
        throw new Error('Failed to bond tokens!');
      }

      const bondExtraTokensTx = await evmPublicClient.waitForTransactionReceipt(
        {
          hash: bondExtraTokensTxHash,
        }
      );

      if (bondExtraTokensTx.status !== 'success') {
        throw new Error('Failed to bond tokens!');
      }

      notificationApi({
        variant: 'success',
        message: `Successfully bonded ${amountToBond} tTNT.`,
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
  }, [amountToBond, closeModal, notificationApi, walletAddress]);

  return (
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isModalOpen}
        className="w-full max-w-[500px] rounded-2xl bg-mono-0 dark:bg-mono-180"
      >
        <ModalHeader titleVariant="h4" onClose={closeModal}>
          Add Stake
        </ModalHeader>

        <div className="px-8 py-6">
          <BondTokens
            nominatorAddress={walletAddress}
            amountToBond={amountToBond}
            setAmountToBond={setAmountToBond}
            amountToBondError={amountToBondError}
            amountWalletBalance={
              walletBalance && walletBalance.value1 ? walletBalance.value1 : 0
            }
          />
        </div>

        <ModalFooter className="flex flex-col gap-1 px-8 py-6">
          <Button
            isFullWidth
            isDisabled={!continueToSignAndSubmitTx}
            isLoading={isBondMoreTxLoading}
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

export default BondMoreTxContainer;
