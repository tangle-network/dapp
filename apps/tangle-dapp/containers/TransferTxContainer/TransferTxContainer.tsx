import { isAddress } from '@polkadot/util-crypto';
import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';
import {
  AmountInput,
  BridgeInputGroup,
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  RecipientInput,
  TxConfirmationRing,
  Typography,
} from '@webb-tools/webb-ui-components';
import { TANGLE_DOCS_URL } from '@webb-tools/webb-ui-components/constants';
import Link from 'next/link';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { isHex } from 'viem';

import useNetworkStore from '../../context/useNetworkStore';
import useBalances from '../../data/balances/useBalances';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import useSubstrateTx, { TxStatus } from '../../hooks/useSubstrateTx';
import convertAmountStringToChainUnits from '../../utils/convertAmountStringToChainUnits';
import { CHAIN_UNIT_CONVERSION_FACTOR } from '../../utils/convertChainUnitsToNumber';
import { formatTokenBalance } from '../../utils/polkadot/tokens';
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
  const [amount, setAmount] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');

  const {
    execute: executeTransferTx,
    status,
    error: txError,
  } = useSubstrateTx(
    useCallback(
      async (api) => {
        // The amount is in the smallest unit of the token,
        // so it needs to be converted to the appropriate amount
        // of decimals.
        const amountInChainUnits = convertAmountStringToChainUnits(amount);

        // By 'allow death', it means that the transaction will
        // go through even if the sender's account balance would
        // be reduced to an amount that is less than the existential
        // deposit, essentially causing the account to be 'reaped'
        // or deleted from the chain.
        return api.tx.balances.transferAllowDeath(
          receiverAddress,
          amountInChainUnits
        );
      },
      [amount, receiverAddress]
    ),
    true
  );

  // TODO: Likely would ideally want to control this from the parent component.
  const reset = useCallback(() => {
    setIsModalOpen(false);
    setAmount('');
    setReceiverAddress('');
  }, [setIsModalOpen]);

  // Reset state when the transaction is complete.
  useEffect(() => {
    if (status === TxStatus.COMPLETE) {
      reset();
    }
  }, [reset, status]);

  const setMaxAmount = useCallback(() => {
    if (transferrableBalance === null) {
      return;
    }

    setAmount(
      transferrableBalance.div(CHAIN_UNIT_CONVERSION_FACTOR).toString()
    );
  }, [transferrableBalance]);

  const isReady = status !== TxStatus.PROCESSING;
  const isDataValid = amount !== '' && receiverAddress !== '';
  const canInitiateTx = isReady && isDataValid;

  const isValidReceiverAddress =
    isAddress(receiverAddress) || isHex(receiverAddress);

  const displayAmount = useMemo(
    () =>
      formatTokenBalance(
        convertAmountStringToChainUnits(amount === '' ? '0' : amount)
      ),
    [amount]
  );

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
            title={displayAmount}
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
            <AmountInput
              onMaxBtnClick={setMaxAmount}
              isDisabled={!isReady}
              amount={amount}
              onAmountChange={(nextAmount) => setAmount(nextAmount)}
              className="bg-mono-20 dark:bg-mono-160"
            />

            <RecipientInput
              className="bg-mono-20 dark:bg-mono-160"
              title="Receiver Address"
              placeholder="EVM or Substrate"
              onChange={(nextReceiverAddress) =>
                setReceiverAddress(nextReceiverAddress)
              }
            />
          </BridgeInputGroup>

          {/* TODO: This is temporary, to display the error message if one ocurred during the transaction. */}
          {txError !== null && (
            <Typography variant="body1" color="red" fw="normal">
              {txError.message}
            </Typography>
          )}

          {!isValidReceiverAddress && receiverAddress !== '' && (
            <Typography variant="body1" fw="normal" className="!text-red-50">
              Invalid receiver address
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
