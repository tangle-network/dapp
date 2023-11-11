import { type FC, useMemo, useState, useEffect } from 'react';
import { Typography } from '@webb-tools/webb-ui-components';
import { Note } from '@webb-tools/sdk-core';

import InputOrOutputNotes from './InputOrOutputNotes';
import SourceOrDestinationWalletInfo from './SourceOrDestinationWalletInfo';
import TxBasicInfo from './TxBasicInfo';
import { TxDetailContainerProps } from './types';

const TxDetailContainer: FC<TxDetailContainerProps> = ({
  hash,
  activity,
  amount,
  noteAccountAddress,
  walletAddress,
  fungibleTokenSymbol,
  wrappableTokenSymbol,
  timestamp,
  relayerName,
  relayerFeeAmount,
  inputNoteSerializations,
  outputNoteSerializations,
}) => {
  const [inputNotes, setInputNotes] = useState<Note[]>([]);
  const [outputNotes, setOutputNotes] = useState<Note[]>([]);

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

  const sourceTypedChainId = useMemo(() => {
    // deposit
    if (activity === 'deposit') {
      return outputNotes.length > 0
        ? +outputNotes[0].note.sourceChainId
        : undefined;
    }

    // withdraw & transfer
    if (inputNotes.length === 0) return undefined;
    return +inputNotes[0].note.targetChainId;
  }, [activity, inputNotes, outputNotes]);

  const destinationTypedChainId = useMemo(() => {
    // deposit
    if (activity === 'deposit') {
      return outputNotes.length > 0
        ? +outputNotes[0].note.targetChainId
        : undefined;
    }

    // withdraw & transfer
    if (outputNotes.length === 0) return undefined;
    return +outputNotes[0].note.targetChainId;
  }, [activity, outputNotes]);

  return (
    <div className="flex-1 p-9 space-y-9 overflow-y-auto">
      {/* Basic Info */}
      <TxBasicInfo
        amount={amount}
        fungibleTokenSymbol={fungibleTokenSymbol}
        wrappableTokenSymbol={wrappableTokenSymbol}
        relayerName={relayerName}
        relayerFeeAmount={relayerFeeAmount}
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
            wrappableTokenSymbol={wrappableTokenSymbol}
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
            wrappableTokenSymbol={wrappableTokenSymbol}
            fungibleTokenSymbol={fungibleTokenSymbol}
          />
        </div>
      )}
    </div>
  );
};

export default TxDetailContainer;
