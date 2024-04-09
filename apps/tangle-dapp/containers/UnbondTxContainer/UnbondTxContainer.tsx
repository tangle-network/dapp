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
import { useTxConfirmationModal } from '../../context/TxConfirmationContext';
import useNetworkStore from '../../context/useNetworkStore';
import useTotalStakedAmountSubscription from '../../data/NominatorStats/useTotalStakedAmountSubscription';
import useUnbondingAmountSubscription from '../../data/NominatorStats/useUnbondingAmountSubscription';
import useExecuteTxWithNotification from '../../hooks/useExecuteTxWithNotification';
import { evmToSubstrateAddress } from '../../utils';
import { unBondTokens as unbondTokensEvm } from '../../utils/evm';
import formatBnToDisplayAmount from '../../utils/formatBnToDisplayAmount';
import { unbondTokens as unbondTokensSubstrate } from '../../utils/polkadot';
import { UnbondTxContainerProps } from './types';

const UnbondTxContainer: FC<UnbondTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { notificationApi } = useWebbUI();
  const { activeAccount } = useWebContext();
  const executeTx = useExecuteTxWithNotification();
  const { setTxConfirmationState } = useTxConfirmationModal();
  const { rpcEndpoint, nativeTokenSymbol } = useNetworkStore();

  const [amountToUnbond, setAmountToUnbond] = useState<BN | null>(null);
  const [isUnbondTxLoading, setIsUnbondTxLoading] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);

  const walletAddress = useMemo(() => {
    if (!activeAccount?.address) {
      return '0x0';
    }

    return activeAccount.address;
  }, [activeAccount?.address]);

  const substrateAddress = useMemo(() => {
    if (!activeAccount?.address) {
      return '';
    } else if (isSubstrateAddress(activeAccount?.address)) {
      return activeAccount.address;
    }

    return evmToSubstrateAddress(activeAccount.address) ?? '';
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

    if (!unbondingAmountData?.value1) {
      return undefined;
    }

    return totalStakedBalance.sub(unbondingAmountData.value1);
  }, [
    notificationApi,
    totalStakedBalance,
    unbondingAmountData?.value1,
    unbondingAmountError,
  ]);

  const continueToSignAndSubmitTx = useMemo(() => {
    return (
      amountToUnbond !== null &&
      amountToUnbond.gt(BN_ZERO) &&
      walletAddress !== '0x0' &&
      !hasErrors
    );
  }, [amountToUnbond, hasErrors, walletAddress]);

  const closeModal = useCallback(() => {
    setIsUnbondTxLoading(false);
    setIsModalOpen(false);
    setAmountToUnbond(null);
    setHasErrors(false);
  }, [setIsModalOpen]);

  const handleSetErrorMessage = useCallback(
    (error: string | null) => {
      setHasErrors(error !== null);
    },
    [setHasErrors]
  );

  const submitAndSignTx = useCallback(async () => {
    setIsUnbondTxLoading(true);

    try {
      if (amountToUnbond === null) {
        throw new Error('Amount to unbond is required.');
      }
      const unbondingAmount = +formatBnToDisplayAmount(amountToUnbond);
      const hash = await executeTx(
        () => unbondTokensEvm(walletAddress, unbondingAmount),
        () =>
          unbondTokensSubstrate(rpcEndpoint, walletAddress, unbondingAmount),
        `Successfully unbonded ${unbondingAmount} ${nativeTokenSymbol}.`,
        'Failed to unbond tokens!'
      );

      setTxConfirmationState({
        isOpen: true,
        status: 'success',
        hash: hash,
        txType: isSubstrateAddress(walletAddress) ? 'substrate' : 'evm',
      });
    } catch {
      setTxConfirmationState({
        isOpen: true,
        status: 'error',
        hash: '',
        txType: isSubstrateAddress(walletAddress) ? 'substrate' : 'evm',
      });
    } finally {
      closeModal();
    }
  }, [
    amountToUnbond,
    closeModal,
    executeTx,
    rpcEndpoint,
    setTxConfirmationState,
    walletAddress,
    nativeTokenSymbol,
  ]);

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

        <div className="p-9 space-y-4">
          <AmountInput
            id="unbond-input"
            title="Amount"
            max={remainingStakedBalanceToUnbond}
            amount={amountToUnbond}
            setAmount={setAmountToUnbond}
            baseInputOverrides={{ isFullWidth: true }}
            maxErrorMessage="Not enough staked balance"
            setErrorMessage={handleSetErrorMessage}
            isDisabled={isUnbondTxLoading}
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
