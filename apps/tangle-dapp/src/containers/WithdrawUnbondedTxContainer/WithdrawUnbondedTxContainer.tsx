import { BN_ZERO } from '@polkadot/util';
import {
  Button,
  Caption,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
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
          onInteractOutside={() => setIsModalOpen(false)}
          isOpen={isModalOpen}
          size="sm"
        >
          <ModalHeader onClose={closeModal}>Withdraw Funds</ModalHeader>

          <ModalBody>
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

            <Caption>
              Funds withdrawn will be moved from the 'unbonded' state to your
              account's available balance.
            </Caption>
          </ModalBody>

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
