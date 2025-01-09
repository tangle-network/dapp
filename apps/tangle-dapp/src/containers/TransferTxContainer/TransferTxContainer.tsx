import { BN, BN_ZERO } from '@polkadot/util';
import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import {
  Alert,
  BridgeInputGroup,
  isEvmAddress,
  isSubstrateAddress,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
  TxConfirmationRing,
  Typography,
} from '@webb-tools/webb-ui-components';
import { TANGLE_DOCS_URL } from '@webb-tools/webb-ui-components/constants';
import { FC, ReactNode, useCallback, useEffect, useState } from 'react';
import { isHex } from 'viem';

import AddressInput, { AddressType } from '../../components/AddressInput';
import AmountInput from '../../components/AmountInput';
import useBalances from '../../data/balances/useBalances';
import useExistentialDeposit from '../../data/balances/useExistentialDeposit';
import useTransferTx from '../../data/balances/useTransferTx';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import { TxStatus } from '../../hooks/useSubstrateTx';
import formatTangleBalance from '../../utils/formatTangleBalance';

export type TransferTxContainerProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
};

function getTypedChainIdFromAddr(address: string | null): number | undefined {
  // Default to undefined if the address is null, which
  // means that the address is not yet known/available.
  if (address === null) {
    return undefined;
  }
  // If the address is a valid hex string (begins with 0x),
  // it's an EVM address.
  else if (isHex(address)) {
    return PresetTypedChainId.TangleTestnetEVM;
  }
  // Otherwise, check if the address is a valid Substrate address.
  else if (isSubstrateAddress(address)) {
    return PresetTypedChainId.TangleTestnetNative;
  }

  return undefined;
}

const TransferTxContainer: FC<TransferTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const activeAccountAddress = useActiveAccountAddress();
  const { nativeTokenSymbol } = useNetworkStore();
  const { transferable: transferableBalance } = useBalances();
  const existentialDeposit = useExistentialDeposit();

  const [amount, setAmount] = useState<BN | null>(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [hasErrors, setHasErrors] = useState(false);

  const {
    execute: executeTransferTx,
    status,
    reset: resetTransferTx,
  } = useTransferTx();

  // TODO: Likely would ideally want to control this from the parent component.
  const reset = useCallback(() => {
    setIsModalOpen(false);
    setAmount(null);
    setRecipientAddress('');
    resetTransferTx?.();
  }, [resetTransferTx, setIsModalOpen]);

  // Reset state when the transaction is complete.
  useEffect(() => {
    if (status === TxStatus.COMPLETE) {
      reset();
    }
  }, [reset, status]);

  const isMaxAmount =
    transferableBalance !== null &&
    amount !== null &&
    transferableBalance.eq(amount);

  const isValidReceiverAddress =
    isSubstrateAddress(recipientAddress) || isEvmAddress(recipientAddress);

  const isReady =
    status !== TxStatus.PROCESSING &&
    executeTransferTx !== null &&
    amount !== null &&
    amount.gt(BN_ZERO) &&
    isValidReceiverAddress &&
    !hasErrors &&
    transferableBalance !== null;

  const handleSend = useCallback(() => {
    if (!isReady) {
      return;
    }

    executeTransferTx({
      recipientAddress,
      amount,
      maxAmount: transferableBalance,
    });
  }, [
    amount,
    executeTransferTx,
    isReady,
    recipientAddress,
    transferableBalance,
  ]);

  const handleSetErrorMessage = useCallback(
    (error: string | null) => {
      setHasErrors(error !== null);
    },
    [setHasErrors],
  );

  const transferableBalanceTooltip: ReactNode = transferableBalance !==
    null && (
    <span>
      You have{' '}
      <strong>
        {formatTangleBalance(transferableBalance, nativeTokenSymbol)}
      </strong>{' '}
      available to transfer.
    </span>
  );

  return (
    <Modal>
      <ModalContent
        onInteractOutside={() => setIsModalOpen(false)}
        isOpen={isModalOpen}
        size="md"
        onCloseAutoFocus={reset}
      >
        <ModalHeader onClose={() => setIsModalOpen(false)}>
          Send {nativeTokenSymbol} Tokens
        </ModalHeader>

        <ModalBody className="overflow-clip">
          <Typography variant="body1" fw="normal">
            Quickly transfer your {nativeTokenSymbol} tokens to an account on
            the Tangle network. You can choose to send to either an EVM or a
            Substrate address.
          </Typography>

          <TxConfirmationRing
            title={formatTangleBalance(amount ?? BN_ZERO, nativeTokenSymbol)}
            source={{
              address: activeAccountAddress,
              typedChainId: getTypedChainIdFromAddr(activeAccountAddress),
            }}
            dest={{
              address: recipientAddress,
              typedChainId: getTypedChainIdFromAddr(recipientAddress),
            }}
          />

          <BridgeInputGroup className="space-y-4 p-0 !bg-transparent">
            <AmountInput
              id="transfer-tx-amount-input"
              title="Amount"
              max={
                status === TxStatus.NOT_YET_INITIATED
                  ? transferableBalance
                  : null
              }
              min={existentialDeposit}
              amount={amount}
              setAmount={setAmount}
              wrapperOverrides={{
                isFullWidth: true,
                tooltip: transferableBalanceTooltip,
              }}
              maxErrorMessage="Not enough available balance"
              minErrorMessage={`Amount must be at least ${formatTangleBalance(
                existentialDeposit,
                nativeTokenSymbol,
              )}`}
              setErrorMessage={handleSetErrorMessage}
            />

            <AddressInput
              id="transfer-tx-receiver-input"
              type={AddressType.SUBSTRATE_OR_EVM}
              title="Receiver Address"
              placeholder="EVM or Substrate"
              wrapperOverrides={{ isFullWidth: true }}
              value={recipientAddress}
              setValue={setRecipientAddress}
              setErrorMessage={handleSetErrorMessage}
            />
          </BridgeInputGroup>

          {isMaxAmount && (
            <Alert
              type="warning"
              size="sm"
              description="Consider keeping a small amount for transaction fees and future transactions."
            />
          )}
        </ModalBody>

        <ModalFooterActions
          learnMoreLinkHref={TANGLE_DOCS_URL}
          isProcessing={status === TxStatus.PROCESSING}
          isConfirmDisabled={!isReady}
          onConfirm={handleSend}
          confirmButtonText="Send"
        />
      </ModalContent>
    </Modal>
  );
};

export default TransferTxContainer;
