import { isAddress, isEthereumAddress } from '@polkadot/util-crypto';
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

import { TANGLE_TOKEN_UNIT } from '../../constants';
import useBalances from '../../data/balances/useBalances';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import useSubstrateTx, { TxStatus } from '../../hooks/useSubstrateTx';
import convertToChainUnits from '../../utils/convertToChainUnits';
import getTxStatusText from '../../utils/getTxStatusText';
import { formatTokenBalance } from '../../utils/polkadot/tokens';
import { TransferTxContainerProps } from './types';

const TransferTxContainer: FC<TransferTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const accAddress = useActiveAccountAddress();
  const [amount, setAmount] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const { transferrable: transferrableBalance } = useBalances();

  const formattedTransferrableBalance =
    transferrableBalance !== null
      ? formatTokenBalance(transferrableBalance, false)
      : null;

  const {
    execute: executeTransferTx,
    status,
    error: txError,
  } = useSubstrateTx(
    useCallback(
      async (api) => {
        const amountAsNumber = Number(amount);

        // The amount is in the smallest unit of the token,
        // so it needs to be converted to the appropriate amount
        // of decimals.
        const amountInChainUnits = convertToChainUnits(amountAsNumber);

        return api.tx.balances.transfer(receiverAddress, amountInChainUnits);
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
    if (status === TxStatus.Complete) {
      reset();
    }
  }, [reset, status]);

  const setMaxAmount = useCallback(() => {
    if (formattedTransferrableBalance === null) {
      return;
    }

    setAmount(formattedTransferrableBalance);
  }, [formattedTransferrableBalance]);

  const isReady = status !== TxStatus.Processing;
  const isDataValid = amount !== '' && receiverAddress !== '';
  const canInitiateTx = isReady && isDataValid;
  const isValidReceiverAddress =
    isAddress(receiverAddress) || isEthereumAddress(receiverAddress);

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
            Quickly transfer your {TANGLE_TOKEN_UNIT} tokens to a receiver on
            the Tangle Network. You can choose to send to either an EVM or a
            Substrate address.
          </Typography>

          <TxConfirmationRing
            source={{
              address: accAddress,
              typedChainId: getTypedChainIdFromAddr(accAddress),
            }}
            dest={{
              address: receiverAddress,
              typedChainId: getTypedChainIdFromAddr(receiverAddress),
            }}
            title={`${amount ? amount : 0} ${TANGLE_TOKEN_UNIT}`}
            isInNextApp
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
              onChange={(nextReceiverAddress) =>
                setReceiverAddress(nextReceiverAddress)
              }
              title="Receiver Address"
              placeholder="EVM or Substrate"
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
              isDisabled={
                !canInitiateTx ||
                executeTransferTx === null ||
                !isValidReceiverAddress
              }
              isLoading={!isReady}
              loadingText={getTxStatusText(status)}
              onClick={
                executeTransferTx !== null ? executeTransferTx : undefined
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

/** @internal */
function getTypedChainIdFromAddr(addr?: string | null): number {
  if (!addr) return NaN;
  if (isEthereumAddress(addr)) return PresetTypedChainId.TangleTestnetEVM;
  if (isAddress(addr)) return PresetTypedChainId.TangleTestnetNative;
  return NaN;
}
