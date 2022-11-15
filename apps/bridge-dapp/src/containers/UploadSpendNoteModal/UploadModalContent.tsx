import { Key } from '@webb-tools/icons';
import { Note } from '@webb-tools/sdk-core';
import { uniqueId } from 'lodash';
import {
  FileUploadArea,
  FileUploadItem,
  FileUploadList,
  getHumanFileSize,
  notificationApi,
  Progress,
  TokenPairIcons,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { UploadModalContentProps } from './types';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { ethers } from 'ethers';

export const UploadModalContent: FC<UploadModalContentProps> = ({
  onNotesChange,
}) => {
  const {
    apiConfig: { currencies },
  } = useWebContext();

  // State for uploaded file
  const [file, setFile] = useState<File | undefined>();

  // State for processed notes
  const [notes, setNotes] = useState<Record<string, Note>>({});

  // State for note processing value
  const [progress, setProgress] = useState(0);

  // Event handler for uploading files
  const handleUpload = useCallback((files: File[]) => {
    if (files.length) {
      setFile(files[0]);
    }
  }, []);

  // useMemo for note size
  const noteSize = useMemo(() => Object.keys(notes).length, [notes]);

  // Effect run when file changes
  useEffect(() => {
    async function processFile() {
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = async () => {
        const text = reader.result as string;

        const parsedNote = JSON.parse(text);

        if (typeof parsedNote === 'string') {
          const note = await Note.deserialize(parsedNote);
          setProgress(100);
          const id = uniqueId();
          setNotes((prev) => ({ ...prev, [id]: note }));
          onNotesChange?.(id, note);

          return;
        }

        if (
          Array.isArray(parsedNote) &&
          parsedNote.length &&
          typeof parsedNote[0] === 'string'
        ) {
          const notes = parsedNote as string[];

          await Promise.all(
            notes.map(async (note, index) => {
              const parsedNote = await Note.deserialize(note);
              const id = uniqueId();
              setProgress((index / notes.length) * 100);
              setNotes((prev) => ({ ...prev, [id]: parsedNote }));
              onNotesChange?.(id, parsedNote);
            })
          );

          return;
        }

        console.log('Invalid note format');
        notificationApi({
          variant: 'error',
          message: 'Invalid note format',
        });
      };
    }

    processFile();
  }, [file, onNotesChange]);

  return (
    <>
      <FileUploadArea onDrop={handleUpload} />

      {file && (
        <FileUploadList>
          <FileUploadItem
            Icon={
              <div className="flex items-center justify-center w-6 h-6 rounded bg-mono-180">
                <Key className="!fill-mono-0" />
              </div>
            }
            fileName={file.name}
            extraInfo={
              <>
                <Typography
                  className="text-mono-120 dark:text-mono-80"
                  variant="body1"
                >
                  {getHumanFileSize(file.size, true, 0)}
                </Typography>
                <Progress className="mt-1" value={progress} />
              </>
            }
          />
        </FileUploadList>
      )}

      {noteSize ? (
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
                Icon={
                  <TokenPairIcons
                    token1Symbol="WebbETH"
                    token2Symbol="weth"
                    chainName="Mumbai"
                  />
                }
                fileName="WebbETH/WETH"
                extraInfo={
                  <Typography
                    className="text-mono-120 dark:text-mono-80"
                    variant="body1"
                  >
                    Note balance: {balance}
                  </Typography>
                }
              />
            );
          })}
        </FileUploadList>
      ) : null}
    </>
  );
};
