'use client';

import { BN, BN_ZERO } from '@polkadot/util';
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
import useNetworkStore from '../../context/useNetworkStore';
import useTokenWalletFreeBalance from '../../data/NominatorStats/useTokenWalletFreeBalance';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
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
  const executeTx = useExecuteTxWithNotification();
  const { rpcEndpoint, nativeTokenSymbol } = useNetworkStore();

  const [amountToBond, setAmountToBond] = useState<BN | null>(null);
  const [isBondMoreTxLoading, setIsBondMoreTxLoading] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);

  const walletAddress = useActiveAccountAddress();
  const { data: walletBalance, error: walletBalanceError } =
    useTokenWalletFreeBalance();

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
      walletAddress !== null &&
      amountToBond !== null &&
      amountToBond.gt(BN_ZERO) &&
      !hasErrors
    );
  }, [amountToBond, hasErrors, walletAddress]);

  const closeModal = useCallback(() => {
    setIsBondMoreTxLoading(false);
    setIsModalOpen(false);
    setAmountToBond(null);
    setHasErrors(false);
  }, [setIsModalOpen]);

  const submitAndSignTx = useCallback(async () => {
    setIsBondMoreTxLoading(true);

    try {
      if (amountToBond === null || walletAddress === null) return;

      const bondingAmount = +formatBnToDisplayAmount(amountToBond);

      await executeTx(
        () => bondExtraTokensEvm(walletAddress, bondingAmount),
        () =>
          bondExtraTokensSubstrate(rpcEndpoint, walletAddress, bondingAmount),
        `Successfully bonded ${bondingAmount} ${nativeTokenSymbol}.`,
        'Failed to bond extra tokens!'
      );

      closeModal();
    } catch {
      setIsBondMoreTxLoading(false);
    }
  }, [
    amountToBond,
    closeModal,
    executeTx,
    rpcEndpoint,
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

        <div className="space-y-4 p-9">
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
