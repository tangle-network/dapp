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

import { TOKEN_UNIT } from '../../constants';
import useTotalUnbondedAndUnbondingAmount from '../../data/NominatorStats/useTotalUnbondedAndUnbondingAmount';
import useUnbondingAmountSubscription from '../../data/NominatorStats/useUnbondingAmountSubscription';
import useExecuteTxWithNotification from '../../hooks/useExecuteTxWithNotification';
import {
  convertToSubstrateAddress,
  splitTokenValueAndSymbol,
} from '../../utils';
import { rebondTokens as rebondTokensEvm } from '../../utils/evm';
import { rebondTokens as rebondTokensSubstrate } from '../../utils/polkadot';
import RebondTokens from './RebondTokens';
import { RebondTxContainerProps } from './types';

const RebondTxContainer: FC<RebondTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { notificationApi } = useWebbUI();
  const { activeAccount } = useWebContext();
  const executeTx = useExecuteTxWithNotification();

  const [amountToRebond, setAmountToRebond] = useState<number>(0);
  const [isRebondTxLoading, setIsRebondTxLoading] = useState<boolean>(false);

  const walletAddress = useMemo(() => {
    if (!activeAccount?.address) return '0x0';

    return activeAccount.address;
  }, [activeAccount?.address]);

  const substrateAddress = useMemo(() => {
    if (!activeAccount?.address) return '';

    return convertToSubstrateAddress(activeAccount.address);
  }, [activeAccount?.address]);

  const { data: unbondingAmountData, error: unbondingAmountError } =
    useUnbondingAmountSubscription(substrateAddress);

  const { data: totalUnbondedAndUnbondingAmountData } =
    useTotalUnbondedAndUnbondingAmount(substrateAddress);

  const remainingUnbondedTokensToRebond = useMemo(() => {
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

    return value_;
  }, [notificationApi, unbondingAmountData?.value1, unbondingAmountError]);

  const amountToRebondError = useMemo(() => {
    if (remainingUnbondedTokensToRebond === 0) {
      return 'You have no unbonded tokens to rebond!';
    } else if (amountToRebond > remainingUnbondedTokensToRebond) {
      return `You can only rebond ${remainingUnbondedTokensToRebond} ${TOKEN_UNIT}!`;
    }
  }, [remainingUnbondedTokensToRebond, amountToRebond]);

  const continueToSignAndSubmitTx = useMemo(() => {
    return amountToRebond > 0 && !amountToRebondError && walletAddress !== '0x0'
      ? true
      : false;
  }, [amountToRebond, amountToRebondError, walletAddress]);

  const closeModal = useCallback(() => {
    setIsRebondTxLoading(false);
    setIsModalOpen(false);
    setAmountToRebond(0);
  }, [setIsModalOpen]);

  const submitAndSignTx = useCallback(async () => {
    setIsRebondTxLoading(true);

    await executeTx(
      () => rebondTokensEvm(walletAddress, amountToRebond),
      () => rebondTokensSubstrate(walletAddress, amountToRebond),
      `Successfully rebonded ${amountToRebond} ${TOKEN_UNIT}.`,
      'Failed to rebond tokens!'
    );

    closeModal();
  }, [amountToRebond, closeModal, executeTx, walletAddress]);

  return (
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isModalOpen}
        className="w-full max-w-[416px] rounded-2xl bg-mono-0 dark:bg-mono-180"
      >
        <ModalHeader titleVariant="h4" onClose={closeModal}>
          Rebond Funds
        </ModalHeader>

        <div className="p-9">
          <RebondTokens
            amountToRebond={amountToRebond}
            setAmountToRebond={setAmountToRebond}
            amountToRebondError={amountToRebondError}
            remainingUnbondedTokensToRebond={remainingUnbondedTokensToRebond}
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
            isLoading={isRebondTxLoading}
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

export default RebondTxContainer;
