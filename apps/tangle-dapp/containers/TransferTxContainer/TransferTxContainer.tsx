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
import { FC, useCallback, useEffect, useState } from 'react';
import { isHex } from 'viem';

import { TANGLE_TOKEN_UNIT } from '../../constants';
import useBalances from '../../data/balances/useBalances';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import useSubstrateTx, { TxStatus } from '../../hooks/useSubstrateTx';
import convertAmountStringToChainUnits from '../../utils/convertAmountStringToChainUnits';
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
  const accAddress = useActiveAccountAddress();
  const [amount, setAmount] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const { free: freeBalance } = useBalances();

  const formattedFreeBalance =
    freeBalance !== null ? formatTokenBalance(freeBalance, false) : null;

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
    if (formattedFreeBalance === null) {
      return;
    }

    setAmount(formattedFreeBalance);
  }, [formattedFreeBalance]);

  const isReady = status !== TxStatus.PROCESSING;
  const isDataValid = amount !== '' && receiverAddress !== '';
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
          Transfer {TANGLE_TOKEN_UNIT} Tokens
        </ModalHeader>

        <div className="p-9 flex flex-col gap-4">
          <Typography variant="body1" fw="normal">
            Quickly transfer your {TANGLE_TOKEN_UNIT} tokens to an account on
            the Tangle Network. You can choose to send to either an EVM or a
            Substrate address.
          </Typography>

          <TxConfirmationRing
            title={`${amount ? amount : 0} ${TANGLE_TOKEN_UNIT}`}
            isInNextApp
            source={{
              address: accAddress,
              typedChainId: getTypedChainIdFromAddr(accAddress),
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
