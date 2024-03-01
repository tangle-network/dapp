import {
  AmountInput,
  BridgeInputGroup,
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  RecipientInput,
  Typography,
} from '@webb-tools/webb-ui-components';
import { TANGLE_DOCS_URL } from '@webb-tools/webb-ui-components/constants';
import Link from 'next/link';
import { FC, useCallback, useEffect, useState } from 'react';

import { TANGLE_TOKEN_UNIT } from '../../constants';
import useBalances from '../../data/balances/useBalances';
import useSubstrateTx, { TxStatus } from '../../hooks/useSubstrateTx';
import convertNumberToChainUnits from '../../utils/convertNumberToChainUnits';
import getTxStatusText from '../../utils/getTxStatusText';
import { formatTokenBalance } from '../../utils/polkadot/tokens';
import { TransferTxContainerProps } from './types';

const TransferTxContainer: FC<TransferTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
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
        const amountInChainUnits = convertNumberToChainUnits(amountAsNumber);

        return api.tx.balances.transfer(recipientAddress, amountInChainUnits);
      },
      [amount, recipientAddress]
    ),
    true
  );

  // TODO: Likely would ideally want to control this from the parent component.
  const reset = useCallback(() => {
    setIsModalOpen(false);
    setAmount('');
    setRecipientAddress('');
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
          Transfer {TANGLE_TOKEN_UNIT} Tokens
        </ModalHeader>

        <div className="p-9 flex flex-col gap-4">
          <Typography variant="body1" fw="normal">
            Quickly transfer your {TANGLE_TOKEN_UNIT} tokens to a recipient on
            the Tangle Network. You can choose to send to either an EVM or a
            Substrate address.
          </Typography>

          <BridgeInputGroup className="space-y-4 p-0 !bg-transparent">
            <RecipientInput
              className="bg-mono-20 dark:bg-mono-160"
              onChange={(nextRecipientAddress) =>
                setRecipientAddress(nextRecipientAddress)
              }
            />

            <AmountInput
              onMaxBtnClick={setMaxAmount}
              isDisabled={!isReady}
              amount={amount}
              onAmountChange={(nextAmount) => setAmount(nextAmount)}
              className="bg-mono-20 dark:bg-mono-160"
            />
          </BridgeInputGroup>

          {/* TODO: This is temporary, to display the error message if one ocurred during the transaction. */}
          {txError !== null && (
            <Typography variant="body1" color="red" fw="normal">
              {txError.message}
            </Typography>
          )}
        </div>

        <ModalFooter className="flex flex-col gap-1 px-8 py-6">
          <Button
            isFullWidth
            isDisabled={!canInitiateTx || executeTransferTx === null}
            isLoading={!isReady}
            loadingText={getTxStatusText(status)}
            onClick={executeTransferTx !== null ? executeTransferTx : undefined}
          >
            Send
          </Button>

          <Link href={TANGLE_DOCS_URL} target="_blank">
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
