import {
  Button,
  FileUploadField,
  FileUploadItem,
  FileUploadList,
  TokenPairIcons,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo, useState } from 'react';
import { uniqueId } from 'lodash';
import { Note } from '@webb-tools/sdk-core';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { ethers } from 'ethers';
import { PasteModalContentProps } from './types';

const initialNotes = {
  [uniqueId()]: '',
};

export const PasteModalContent: FC<PasteModalContentProps> = ({
  onNotesChange,
}) => {
  const {
    apiConfig: { currencies },
  } = useWebContext();

  // The raw notes string array from the user
  const [rawNotes, setRawNotes] =
    useState<Record<string, string>>(initialNotes);

  // The serialized notes record
  const [notes, setNotes] = useState<Record<string, Note>>({});

  // The note size memo
  const noteSize = useMemo(() => Object.keys(notes).length, [notes]);

  // Handle upload note
  const handleUpload = useCallback(
    async (id: string) => {
      const rawNote = rawNotes[id];
      const note = await Note.deserialize(rawNote);
      setNotes((prevNotes) => ({ ...prevNotes, [id]: note }));
      onNotesChange(id, note);
    },
    [rawNotes, onNotesChange]
  );

  return (
    <>
      <FileUploadList title="Paste spend notes below:">
        {Object.entries(rawNotes).map(([id, note]) => (
          <FileUploadField
            key={id}
            value={note}
            onChange={(value) => {
              setRawNotes((prev) => ({ ...prev, [id]: value }));
            }}
            onUpload={() => handleUpload(id)}
          />
        ))}
      </FileUploadList>

      <Button
        onClick={() => setRawNotes((prev) => ({ ...prev, [uniqueId()]: '' }))}
        variant="link"
        size="sm"
        className="mt-2"
      >
        Add more
      </Button>

      {!!noteSize && (
        <FileUploadList title={`Available notes: ${noteSize}`}>
          {Object.entries(notes).map(([id, note]) => {
            const sourceChainId = Number(note.note.sourceChainId);
            const sourceChain = chainsPopulated[sourceChainId];

            const destChainId = Number(note.note.targetChainId);
            const destChain = chainsPopulated[destChainId];

            if (!sourceChain || !destChain) {
              return null;
            }

            const sourceCurrency = currencies[sourceChain.nativeCurrencyId];
            const destCurrency = currencies[destChain.nativeCurrencyId];

            if (!sourceCurrency || !destCurrency) {
              return null;
            }

            const balance = ethers.utils.formatUnits(
              note.note.amount,
              note.note.denomination
            );

            return (
              <FileUploadItem
                key={id}
                fileName={`${sourceCurrency.symbol}/${destCurrency.symbol}`}
                Icon={
                  <TokenPairIcons
                    token1Symbol={sourceCurrency.symbol}
                    token2Symbol={destCurrency.symbol}
                    chainName={destChain.name}
                  />
                }
                extraInfo={
                  <Typography
                    variant="body1"
                    className="text-mono-120 dark:text-mono-80"
                  >
                    Note balance: {balance}
                  </Typography>
                }
              />
            );
          })}
        </FileUploadList>
      )}
    </>
  );
};
