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

import { getPolkadotApiPromise } from '../../constants';
import { TransferTxContainerProps } from './types';

const TransferTxContainer: FC<TransferTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const [isPerformingTx, setIsPerformingTx] = useState(false);
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');

  const performTx = useCallback(async () => {
    setIsPerformingTx(true);

    const api = await getPolkadotApiPromise();
    const parsedAmount = parseInt(amount, 10);

    // TODO: Need graceful error handling here: This can fail in many ways, one of them being that the sender doesn't have enough balance, or that the recipient address is invalid.
    api.tx.balances.transfer(recipientAddress, new BN(parsedAmount));
  }, [amount, recipientAddress]);

  return (
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isModalOpen}
        className="w-full max-w-[550px] rounded-2xl bg-mono-0 dark:bg-mono-180"
      >
        <ModalHeader titleVariant="h4" onClose={() => setIsModalOpen(false)}>
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
            <RecipientInput className="dark:bg-mono-160" />

            <AmountInput className="dark:bg-mono-160" />
          </BridgeInputGroup>

          <div className="flex items-center justify-end gap-2">
            <Typography variant="body1" fw="normal">
              Sending to a Substrate address
            </Typography>

            <Switcher />
          </div>
        </div>

        <ModalFooter className="flex flex-col gap-1 px-8 py-6">
          <Button
            isFullWidth
            // isDisabled={!continueToSignAndSubmitTx}
            isLoading={isPerformingTx}
            onClick={performTx}
          >
            Send
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
