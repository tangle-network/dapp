import {
  AmountInput,
  BridgeInputGroup,
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  RecipientInput,
  Switcher,
  Typography,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { WEBB_TANGLE_DOCS_URL } from '@webb-tools/webb-ui-components/constants';
import Link from 'next/link';
import { FC, useCallback, useEffect, useState } from 'react';

import useFormattedAccountBalances from '../../data/AccountSummaryCard/useFormattedAccountBalances';
import useTx, { TxStatus } from '../../hooks/useTx';
import convertToChainUnits from '../../utils/convertToChainUnits';
import getTxStatusText from '../../utils/getTxStatusText';
import { TransferTxContainerProps } from './types';

const TransferTxContainer: FC<TransferTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isSendingToSubstrate, setIsSendingToSubstrate] = useState(false);
  const { free: formattedFreeBalance } = useFormattedAccountBalances(false);
  const { notificationApi } = useWebbUI();

  const {
    perform: performTransferTx,
    status,
    reset: resetTx,
    error: txError,
  } = useTx(
    useCallback(
      async (api) => {
        const decimals = api.registry.chainDecimals[0];
        const amountAsNumber = Number(amount);

        // The amount is in the smallest unit of the token,
        // so it needs to be converted to the appropriate amount
        // of decimals.
        const amountInChainUnits = convertToChainUnits(
          amountAsNumber,
          decimals
        );

        return api.tx.balances.transfer(recipientAddress, amountInChainUnits);
      },
      [amount, recipientAddress]
    )
  );

  // TODO: Likely would ideally want to control this from the parent component.
  const reset = useCallback(() => {
    setIsModalOpen(false);
    setAmount('');
    setRecipientAddress('');
    setIsSendingToSubstrate(false);
    resetTx();
  }, [setIsModalOpen, resetTx]);

  // Close modal and reset state when the transaction is complete.
  useEffect(() => {
    if (status === TxStatus.Complete) {
      reset();

      notificationApi({
        variant: 'success',
        message: 'Transaction complete',
        secondaryMessage: 'Your transaction has been successfully processed.',
      });
    }
  }, [notificationApi, reset, status]);

  const setMaxAmount = useCallback(() => {
    if (formattedFreeBalance === null) {
      return;
    }

    setAmount(formattedFreeBalance);
  }, [formattedFreeBalance]);

  const isReady =
    status === TxStatus.NotYetInitiated ||
    status === TxStatus.TimedOut ||
    status === TxStatus.Error;

  const isDataValid = amount !== '' && recipientAddress !== '';
  const canInitiateTx = isReady && isDataValid;

  return (
    <Modal>
      <ModalContent
        isCenter
        isOpen={isModalOpen}
        className="w-full max-w-[550px] rounded-2xl bg-mono-0 dark:bg-mono-180"
      >
        <ModalHeader titleVariant="h4" onClose={reset}>
          {/* TODO: Fetch or get network token unit instead of having it be hard-coded. */}
          Transfer TNT Tokens
        </ModalHeader>

        <div className="p-9 flex flex-col gap-4">
          <Typography variant="body1" fw="normal">
            Quickly transfer your TNT tokens to a recipient on the Tangle
            Network. Enter the recipient&apos;s EVM address. You can choose to
            send to either an EVM or a Substrate address.
          </Typography>

          <BridgeInputGroup className="space-y-4 p-0 !bg-transparent">
            <RecipientInput
              className="dark:bg-mono-160"
              onChange={(nextRecipientAddress) =>
                setRecipientAddress(nextRecipientAddress)
              }
            />

            <AmountInput
              onMaxBtnClick={setMaxAmount}
              isDisabled={!isReady}
              amount={amount}
              onAmountChange={(nextAmount) => setAmount(nextAmount)}
              className="dark:bg-mono-160"
            />
          </BridgeInputGroup>

          {txError !== null && (
            <Typography variant="body1" color="red" fw="normal">
              {txError instanceof Error
                ? txError.message
                : JSON.stringify(txError)}
            </Typography>
          )}

          <div className="flex items-center justify-end gap-2">
            <Typography variant="body1" fw="normal">
              Send to Substrate
            </Typography>

            <Switcher
              checked={isSendingToSubstrate}
              onCheckedChange={(isChecked) =>
                setIsSendingToSubstrate(isChecked)
              }
            />
          </div>
        </div>

        <ModalFooter className="flex flex-col gap-1 px-8 py-6">
          <Button
            isFullWidth
            isDisabled={!canInitiateTx}
            isLoading={!isReady}
            loadingText={getTxStatusText(status)}
            onClick={performTransferTx}
          >
            Send to {isSendingToSubstrate ? 'Substrate' : 'EVM'}
          </Button>

          <Link href={WEBB_TANGLE_DOCS_URL} target="_blank">
            <Button isFullWidth variant="secondary">
              Learn More
            </Button>
          </Link>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TransferTxContainer;
