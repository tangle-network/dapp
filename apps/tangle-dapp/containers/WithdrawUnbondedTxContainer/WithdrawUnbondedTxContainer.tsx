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
import { type FC, useCallback, useMemo, useState } from 'react';

import {
  evmPublicClient,
  getSlashingSpans,
  withdrawUnbondedTokens,
} from '../../constants';
import useTotalUnbondedAndUnbondingAmount from '../../data/NominatorStats/useTotalUnbondedAndUnbondingAmount';
import { convertEthereumToSubstrateAddress } from '../../utils';
import { RebondTxContainer } from '../RebondTxContainer';
import { WithdrawUnbondedTxContainerProps } from './types';
import WithdrawUnbonded from './WithdrawUnbonded';

const WithdrawUnbondedTxContainer: FC<WithdrawUnbondedTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { notificationApi } = useWebbUI();
  const { activeAccount } = useWebContext();

  const [isRebondModalOpen, setIsRebondModalOpen] = useState(false);

  const [isWithdrawUnbondedTxLoading, setIsWithdrawUnbondedTxLoading] =
    useState<boolean>(false);

  const walletAddress = useMemo(() => {
    if (!activeAccount?.address) return '0x0';

    return activeAccount.address;
  }, [activeAccount?.address]);

  const substrateAddress = useMemo(() => {
    if (!activeAccount?.address) return '';

    return convertEthereumToSubstrateAddress(activeAccount.address);
  }, [activeAccount?.address]);

  const {
    data: totalUnbondedAndUnbondingAmountData,
    error: totalUnbondedAndUnbondingAmountError,
  } = useTotalUnbondedAndUnbondingAmount(substrateAddress);

  const totalUnbondedAmountAvailableToWithdraw = useMemo(() => {
    if (totalUnbondedAndUnbondingAmountError) {
      notificationApi({
        variant: 'error',
        message: totalUnbondedAndUnbondingAmountError.message,
      });
    }

    if (!totalUnbondedAndUnbondingAmountData?.value1?.unbonded) return NaN;

    return totalUnbondedAndUnbondingAmountData.value1.unbonded;
  }, [
    notificationApi,
    totalUnbondedAndUnbondingAmountData,
    totalUnbondedAndUnbondingAmountError,
  ]);

  const continueToSignAndSubmitTx = useMemo(() => {
    return !isNaN(totalUnbondedAmountAvailableToWithdraw) &&
      totalUnbondedAmountAvailableToWithdraw > 0 &&
      walletAddress !== '0x0'
      ? true
      : false;
  }, [totalUnbondedAmountAvailableToWithdraw, walletAddress]);

  const closeModal = useCallback(() => {
    setIsWithdrawUnbondedTxLoading(false);
    setIsModalOpen(false);
  }, [setIsModalOpen]);

  const submitAndSignTx = useCallback(async () => {
    setIsWithdrawUnbondedTxLoading(true);

    try {
      const slashingSpans = await getSlashingSpans(substrateAddress);

      const withdrawUnbondedTxHash = await withdrawUnbondedTokens(
        walletAddress,
        Number(slashingSpans)
      );

      if (!withdrawUnbondedTxHash) {
        throw new Error('Failed to withdraw unbonded tokens!');
      }

      const withdrawUnbondedTx =
        await evmPublicClient.waitForTransactionReceipt({
          hash: withdrawUnbondedTxHash,
        });

      if (withdrawUnbondedTx.status !== 'success') {
        throw new Error('Failed to withdraw unbonded tokens!');
      }

      notificationApi({
        variant: 'success',
        message: `Successfully withdraw!`,
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
  }, [closeModal, notificationApi, substrateAddress, walletAddress]);

  const onRebondClick = () => {
    closeModal();
    setIsRebondModalOpen(true);
  };

  return (
    <>
      <Modal open>
        <ModalContent
          isCenter
          isOpen={isModalOpen}
          className="w-full max-w-[500px] rounded-2xl bg-mono-0 dark:bg-mono-180"
        >
          <ModalHeader titleVariant="h4" onClose={closeModal}>
            Withdraw Funds
          </ModalHeader>

          <div className="px-8 py-6">
            <WithdrawUnbonded
              unbondedAmount={
                totalUnbondedAndUnbondingAmountData?.value1?.unbonded ?? 0
              }
              unbondingAmount={
                totalUnbondedAndUnbondingAmountData?.value1?.unbonding ?? 0
              }
            />
          </div>

          <ModalFooter className="px-8 py-6 flex flex-col gap-1">
            <Button
              isFullWidth
              isDisabled={!continueToSignAndSubmitTx}
              isLoading={isWithdrawUnbondedTxLoading}
              onClick={submitAndSignTx}
            >
              Confirm
            </Button>

            <Button isFullWidth onClick={onRebondClick} variant="secondary">
              Rebond
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <RebondTxContainer
        isModalOpen={isRebondModalOpen}
        setIsModalOpen={setIsRebondModalOpen}
      />
    </>
  );
};

export default WithdrawUnbondedTxContainer;
