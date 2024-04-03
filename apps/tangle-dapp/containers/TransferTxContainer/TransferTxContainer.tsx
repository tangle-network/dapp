import { BN, BN_ZERO } from '@polkadot/util';
import { isAddress } from '@polkadot/util-crypto';
import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';
import {
  BridgeInputGroup,
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  TxConfirmationRing,
  Typography,
} from '@webb-tools/webb-ui-components';
import { TANGLE_DOCS_URL } from '@webb-tools/webb-ui-components/constants';
import Link from 'next/link';
import { FC, useCallback, useEffect, useState } from 'react';
import { isHex } from 'viem';

import AddressInput2, {
  AddressType,
} from '../../components/AddressInput2/AddressInput2';
import AmountInput2 from '../../components/AmountInput2/AmountInput2';
import useNetworkStore from '../../context/useNetworkStore';
import useBalances from '../../data/balances/useBalances';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import useSubstrateTx, { TxStatus } from '../../hooks/useSubstrateTx';
import { formatTokenBalance } from '../../utils/polkadot';
import { TransferTxContainerProps } from './types';

function getTxStatusText(status: TxStatus): string {
  switch (status) {
    case TxStatus.NOT_YET_INITIATED:
      return 'Not initiated';
    case TxStatus.PROCESSING:
      return 'Processing';
    case TxStatus.ERROR:
      return 'Error';
    case TxStatus.COMPLETE:
      return 'Complete';
    case TxStatus.TIMED_OUT:
      return 'Timed out';
  }
}

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
  else if (isAddress(address)) {
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
  const { transferrable: transferrableBalance } = useBalances();
  const [amount, setAmount] = useState<BN | null>(null);
  const [receiverAddress, setReceiverAddress] = useState('');

  const {
    execute: executeTransferTx,
    status,
    error: txError,
  } = useSubstrateTx(
    useCallback(
      async (api) => {
        if (amount === null) {
          return null;
        }

        // By 'allow death', it means that the transaction will
        // go through even if the sender's account balance would
        // be reduced to an amount that is less than the existential
        // deposit, essentially causing the account to be 'reaped'
        // or deleted from the chain.
        return api.tx.balances.transferAllowDeath(receiverAddress, amount);
      },
      [amount, receiverAddress]
    ),
    true
  );

  // TODO: Likely would ideally want to control this from the parent component.
  const reset = useCallback(() => {
    setIsModalOpen(false);
    setAmount(null);
    setReceiverAddress('');
  }, [setIsModalOpen]);

  // Reset state when the transaction is complete.
  useEffect(() => {
    if (status === TxStatus.COMPLETE) {
      reset();
    }
  }, [reset, status]);

  const isReady = status !== TxStatus.PROCESSING;
  const isDataValid = amount !== null && receiverAddress !== '';
  const canInitiateTx = isReady && isDataValid;

  const isValidReceiverAddress =
    isAddress(receiverAddress) || isHex(receiverAddress);

  return (
    <Modal>
      <ModalContent
        isCenter
        isOpen={isModalOpen}
        className="w-full max-w-[550px] rounded-2xl bg-mono-0 dark:bg-mono-180"
      >
        <ModalHeader titleVariant="h4" onClose={reset}>
          Transfer {nativeTokenSymbol} Tokens
        </ModalHeader>

        <div className="p-9 flex flex-col gap-4">
          <Typography variant="body1" fw="normal">
            Quickly transfer your {nativeTokenSymbol} tokens to an account on
            the Tangle Network. You can choose to send to either an EVM or a
            Substrate address.
          </Typography>

          <TxConfirmationRing
            title={formatTokenBalance(amount ?? BN_ZERO, nativeTokenSymbol)}
            isInNextApp
            source={{
              address: activeAccountAddress,
              typedChainId: getTypedChainIdFromAddr(activeAccountAddress),
            }}
            dest={{
              address: receiverAddress,
              typedChainId: getTypedChainIdFromAddr(receiverAddress),
            }}
          />

          <BridgeInputGroup className="space-y-4 p-0 !bg-transparent">
            <AmountInput2
              id="transfer-tx-amount-input"
              title="Amount"
              max={transferrableBalance ?? undefined}
              isDisabled={!isReady}
              amount={amount}
              setAmount={setAmount}
              baseInputOverrides={{ isFullWidth: true }}
              maxErrorMessage="Not enough available balance"
            />

            <AddressInput2
              id="transfer-tx-receiver-input"
              type={AddressType.Both}
              title="Receiver Address"
              placeholder="EVM or Substrate"
              baseInputOverrides={{ isFullWidth: true }}
              value={receiverAddress}
              setValue={setReceiverAddress}
            />
          </BridgeInputGroup>

          {/* TODO: This is temporary, to display the error message if one ocurred during the transaction. */}
          {txError !== null && (
            <Typography variant="body1" color="red" fw="normal">
              {txError.message}
            </Typography>
          )}
        </div>

        <ModalFooter className="flex items-center gap-2 px-8 py-6 space-y-0">
          <div className="flex-1">
            <Button
              isFullWidth
              isLoading={!isReady}
              loadingText={getTxStatusText(status)}
              onClick={
                executeTransferTx !== null ? executeTransferTx : undefined
              }
              isDisabled={
                !canInitiateTx ||
                executeTransferTx === null ||
                !isValidReceiverAddress
              }
            >
              Send
            </Button>
          </div>

          <div className="flex-1">
            <Link href={TANGLE_DOCS_URL} target="_blank" className="w-full">
              <Button isFullWidth variant="secondary">
                Learn More
              </Button>
            </Link>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TransferTxContainer;
