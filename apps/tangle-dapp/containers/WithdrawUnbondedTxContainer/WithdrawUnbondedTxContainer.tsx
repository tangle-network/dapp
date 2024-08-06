'use client';

import { BN_ZERO } from '@polkadot/util';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { type FC, useCallback, useState } from 'react';

import { BondedTokensBalanceInfo } from '../../components/BondedTokensBalanceInfo';
import useUnbondedAmount from '../../data/NominatorStats/useUnbondedAmount';
import useUnbondingAmount from '../../data/NominatorStats/useUnbondingAmount';
import useWithdrawUnbondedTx from '../../data/staking/useWithdrawUnbondedTx';
import { TxStatus } from '../../hooks/useSubstrateTx';
import { RebondTxContainer } from '../RebondTxContainer';
import { WithdrawUnbondedTxContainerProps } from './types';

const WithdrawUnbondedTxContainer: FC<WithdrawUnbondedTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const [isRebondModalOpen, setIsRebondModalOpen] = useState(false);

  const { result: totalUnbondedAmount } = useUnbondedAmount();
  const { result: totalUnbondingAmount } = useUnbondingAmount();

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, [setIsModalOpen]);

  const {
    execute: executeWithdrawUnbondedTx,
    status: withdrawUnbondedTxStatus,
  } = useWithdrawUnbondedTx(totalUnbondedAmount?.value ?? null);

  const submitTx = useCallback(async () => {
    if (executeWithdrawUnbondedTx === null) {
      return;
    }

    await executeWithdrawUnbondedTx();
    closeModal();
  }, [closeModal, executeWithdrawUnbondedTx]);

  const onRebondClick = useCallback(() => {
    closeModal();
    setIsRebondModalOpen(true);
  }, [closeModal]);

  const canSubmitTx =
    totalUnbondedAmount?.value?.isZero() === false &&
    executeWithdrawUnbondedTx !== null;

  return (
    <>
      <Modal open>
        <ModalContent
          isCenter
          isOpen={isModalOpen}
          className="w-full max-w-[416px]"
        >
          <ModalHeader onClose={closeModal}>Withdraw Funds</ModalHeader>

          <div className="p-9 space-y-6">
            <Typography variant="body1" fw="normal">
              {`Upon successful withdrawal, the funds will be moved from the 'unbonded' state to your account's available balance.`}
            </Typography>

            <div className="flex flex-col gap-2">
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

          <ModalFooter className="flex items-center gap-2">
            <Button isFullWidth onClick={onRebondClick} variant="secondary">
              Rebond
            </Button>

            <Button
              isFullWidth
              isDisabled={!canSubmitTx}
              isLoading={withdrawUnbondedTxStatus === TxStatus.PROCESSING}
              onClick={submitTx}
            >
              Confirm
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
