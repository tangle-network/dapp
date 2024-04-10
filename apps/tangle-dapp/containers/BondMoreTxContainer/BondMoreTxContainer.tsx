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
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';

import AmountInput from '../../components/AmountInput/AmountInput';
import { useTxConfirmationModal } from '../../context/TxConfirmationContext';
import useNetworkStore from '../../context/useNetworkStore';
import useTokenWalletFreeBalance from '../../data/NominatorStats/useTokenWalletFreeBalance';
import useExecuteTxWithNotification from '../../hooks/useExecuteTxWithNotification';
import { bondExtraTokens as bondExtraTokensEvm } from '../../utils/evm';
import formatBnToDisplayAmount from '../../utils/formatBnToDisplayAmount';
import { bondExtraTokens as bondExtraTokensSubstrate } from '../../utils/polkadot';
import { BondMoreTxContainerProps } from './types';

const BondMoreTxContainer: FC<BondMoreTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { notificationApi } = useWebbUI();
  const { activeAccount } = useWebContext();
  const executeTx = useExecuteTxWithNotification();
  const { setTxConfirmationState } = useTxConfirmationModal();
  const [amountToBond, setAmountToBond] = useState<BN | null>(null);
  const { rpcEndpoint, nativeTokenSymbol } = useNetworkStore();
  const [isBondMoreTxLoading, setIsBondMoreTxLoading] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);

  const walletAddress = useMemo(() => {
    if (!activeAccount?.address) {
      return '0x0';
    }

    return activeAccount.address;
  }, [activeAccount?.address]);

  const { data: walletBalance, error: walletBalanceError } =
    useTokenWalletFreeBalance(walletAddress);

  useEffect(() => {
    if (walletBalanceError) {
      notificationApi({
        variant: 'error',
        message: walletBalanceError.message,
      });
    }
  }, [notificationApi, walletBalanceError]);

  const handleSetErrorMessage = useCallback(
    (error: string | null) => {
      setHasErrors(error !== null);
    },
    [setHasErrors]
  );

  const continueToSignAndSubmitTx = useMemo(() => {
    return (
      amountToBond !== null &&
      amountToBond.gt(BN_ZERO) &&
      walletAddress !== '0x0' &&
      !hasErrors
    );
  }, [amountToBond, walletAddress, hasErrors]);

  const closeModal = useCallback(() => {
    setIsBondMoreTxLoading(false);
    setIsModalOpen(false);
    setAmountToBond(null);
    setHasErrors(false);
  }, [setIsModalOpen]);

  const submitAndSignTx = useCallback(async () => {
    setIsBondMoreTxLoading(true);

    try {
      if (amountToBond === null) {
        throw new Error('Amount to bond more is required.');
      }
      const bondingAmount = +formatBnToDisplayAmount(amountToBond);
      const hash = await executeTx(
        () => bondExtraTokensEvm(walletAddress, bondingAmount),
        () =>
          bondExtraTokensSubstrate(rpcEndpoint, walletAddress, bondingAmount),
        `Successfully bonded ${bondingAmount} ${nativeTokenSymbol}.`,
        'Failed to bond extra tokens!'
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
    amountToBond,
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
          Add Stake
        </ModalHeader>

        <div className="p-9 space-y-4">
          <AmountInput
            id="add-stake-input"
            title="Amount"
            max={walletBalance?.value1 ?? undefined}
            amount={amountToBond}
            setAmount={setAmountToBond}
            baseInputOverrides={{ isFullWidth: true }}
            maxErrorMessage="Not enough available balance"
            setErrorMessage={handleSetErrorMessage}
            isDisabled={isBondMoreTxLoading}
          />
          <Typography variant="body1" fw="normal">
            Added stake will be bonded and subject to unbonding period before
            withdrawal is possible.
          </Typography>
        </div>

        <ModalFooter className="flex flex-col gap-1 px-8 py-6">
          <Button
            isFullWidth
            isDisabled={!continueToSignAndSubmitTx}
            isLoading={isBondMoreTxLoading}
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

export default BondMoreTxContainer;
