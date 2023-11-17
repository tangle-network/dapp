import { type FC, useState, useEffect, useMemo } from 'react';
import { Typography } from '@webb-tools/webb-ui-components';
import { Note } from '@webb-tools/sdk-core';
import type { TransactionType } from '@webb-tools/abstract-api-provider';

import InputOrOutputNotes from './InputOrOutputNotes';
import SourceOrDestinationWalletInfo from './SourceOrDestinationWalletInfo';
import TxBasicInfo from './TxBasicInfo';

const TxDetailContainer: FC<TransactionType> = ({
  hash,
  activity,
  amount,
  fromAddress,
  recipientAddress,
  fungibleTokenSymbol,
  wrapTokenSymbol,
  unwrapTokenSymbol,
  timestamp,
  relayerName,
  relayerFeesAmount,
  relayerUri,
  refundAmount,
  refundRecipientAddress,
  refundTokenSymbol,
  inputNoteSerializations,
  outputNoteSerializations,
  sourceTypedChainId,
  destinationTypedChainId,
}) => {
  const [inputNotes, setInputNotes] = useState<Note[]>([]);
  const [outputNotes, setOutputNotes] = useState<Note[]>([]);

  const walletAddress = useMemo(() => {
    if (activity === 'deposit') return fromAddress;
    if (activity === 'withdraw') return recipientAddress;
    return undefined;
  }, [activity, fromAddress, recipientAddress]);

  const noteAccountAddress = useMemo(() => {
    if (activity === 'deposit') return recipientAddress;
    return fromAddress;
  }, [activity, fromAddress, recipientAddress]);

  useEffect(() => {
    async function getInputNotes() {
      if (!inputNoteSerializations) return;
      const inputNotes = await Promise.all(
        inputNoteSerializations.map(async (serialization) => {
          return await Note.deserialize(serialization);
        })
      );
      setInputNotes(inputNotes);
    }

    getInputNotes();
  }, [inputNoteSerializations]);

  useEffect(() => {
    async function getOutputNotes() {
      if (!outputNoteSerializations) return;
      const outputNotes = await Promise.all(
        outputNoteSerializations.map(async (serialization) => {
          return await Note.deserialize(serialization);
        })
      );
      setOutputNotes(outputNotes);
    }

    getOutputNotes();
  }, [outputNoteSerializations]);

  return (
    <div className="flex-1 p-9 space-y-9 overflow-y-auto">
      {/* Basic Info */}
      <TxBasicInfo
        amount={amount}
        recipientAddress={recipientAddress}
        fungibleTokenSymbol={fungibleTokenSymbol}
        wrapTokenSymbol={wrapTokenSymbol}
        unwrapTokenSymbol={unwrapTokenSymbol}
        relayerUri={relayerUri}
        relayerName={relayerName}
        relayerFeesAmount={relayerFeesAmount}
        refundAmount={refundAmount}
        refundRecipientAddress={refundRecipientAddress}
        refundTokenSymbol={refundTokenSymbol}
        hash={hash}
        timestamp={timestamp}
      />

      {/* Source Wallet */}
      {activity === 'deposit' && sourceTypedChainId && walletAddress && (
        <div className="space-y-3">
          <Typography variant="body1" fw="bold">
            Source wallet
          </Typography>
          <SourceOrDestinationWalletInfo
            type="source"
            typedChainId={sourceTypedChainId}
            walletAddress={walletAddress}
            amount={amount}
            wrapTokenSymbol={wrapTokenSymbol}
            unwrapTokenSymbol={unwrapTokenSymbol}
            fungibleTokenSymbol={fungibleTokenSymbol}
          />
        </div>
      )}

      {/* Input Notes */}
      {activity !== 'deposit' &&
        inputNotes.length > 0 &&
        sourceTypedChainId && (
          <div className="space-y-3">
            <Typography variant="body1" fw="bold">
              Inputs ({inputNotes.length})
            </Typography>
            <InputOrOutputNotes
              activity={activity}
              type="input"
              notes={inputNotes}
              noteAccountAddress={noteAccountAddress}
              fungibleTokenSymbol={fungibleTokenSymbol}
              typedChainId={sourceTypedChainId}
            />
          </div>
        )}

      {/* Output Notes */}
      {outputNotes.length > 0 && destinationTypedChainId && (
        <div className="space-y-3">
          <Typography variant="body1" fw="bold">
            Outputs ({outputNotes.length})
          </Typography>
          <InputOrOutputNotes
            activity={activity}
            type="output"
            notes={outputNotes}
            noteAccountAddress={noteAccountAddress}
            fungibleTokenSymbol={fungibleTokenSymbol}
            typedChainId={destinationTypedChainId}
          />
        </div>
      )}

      {/* Destination Wallet */}
      {activity === 'withdraw' && destinationTypedChainId && walletAddress && (
        <div className="space-y-3">
          <Typography variant="body1" fw="bold">
            Destination wallet
          </Typography>
          <SourceOrDestinationWalletInfo
            type="destination"
            typedChainId={destinationTypedChainId}
            walletAddress={walletAddress}
            amount={amount}
            wrapTokenSymbol={wrapTokenSymbol}
            unwrapTokenSymbol={unwrapTokenSymbol}
            fungibleTokenSymbol={fungibleTokenSymbol}
          />
        </div>
      )}
    </div>
  );
};

export default TxDetailContainer;
