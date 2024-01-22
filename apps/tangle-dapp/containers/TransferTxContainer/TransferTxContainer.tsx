import { BN } from '@polkadot/util';
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
} from '@webb-tools/webb-ui-components';
import { WEBB_TANGLE_DOCS_URL } from '@webb-tools/webb-ui-components/constants';
import Link from 'next/link';
import { FC, useCallback, useState } from 'react';

import useFormattedAccountBalances from '../../data/AccountSummaryCard/useFormattedAccountBalances';
import useTx, { TxStatus } from '../../hooks/useTx';
import { TransferTxContainerProps } from './types';

const getTxStatusText = (status: TxStatus) => {
  switch (status) {
    case TxStatus.NotInitiated:
      return 'Not initiated';
    case TxStatus.Processing:
      return 'Processing';
    case TxStatus.Error:
      return 'Error';
    case TxStatus.Complete:
      return 'Complete';
  }
};

const TransferTxContainer: FC<TransferTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isSendingToSubstrate, setIsSendingToSubstrate] = useState(false);
  const { free: formattedFreeBalance } = useFormattedAccountBalances(false);

  const { perform: performTransferTx, status } = useTx(
    useCallback(
      // TODO: Need to format amount appropriately, since BN will interpret it as a decimal, thus having it be a significantly lower value than what it actually is. Find if there's a way to do this with the Polkadot API, or if there's already a utility function for this. Verify that this is the case by looking at the transaction details on a wallet when sending a transaction.
      async (api) => api.tx.balances.transfer(recipientAddress, new BN(amount)),
      [amount, recipientAddress]
    )
  );

  // TODO: Likely would want to control this from the parent component.
  const reset = () => {
    setIsModalOpen(false);
    setAmount('');
    setRecipientAddress('');
    setIsSendingToSubstrate(false);
  };

  const setMaxAmount = useCallback(() => {
    if (formattedFreeBalance === null) {
      return;
    }

    setAmount(formattedFreeBalance);
  }, [formattedFreeBalance]);

  const canInitiateTx =
    status === TxStatus.NotInitiated &&
    amount !== '' &&
    recipientAddress !== '';

  const isProcessingAndNotReady = status > TxStatus.NotInitiated;

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
              isDisabled={isProcessingAndNotReady}
              amount={amount}
              onAmountChange={(nextAmount) => setAmount(nextAmount)}
              className="dark:bg-mono-160"
            />
          </BridgeInputGroup>

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
            isLoading={isProcessingAndNotReady}
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
