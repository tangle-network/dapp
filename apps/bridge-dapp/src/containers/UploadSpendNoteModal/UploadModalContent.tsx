import { useWebContext } from '@webb-tools/api-provider-environment';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { KeyIcon } from '@webb-tools/icons';
import { Note } from '@webb-tools/sdk-core';
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
import { ethers } from 'ethers';
import { uniqueId } from 'lodash';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { UploadModalContentProps } from './types';

export const UploadModalContent: FC<UploadModalContentProps> = ({
  onNotesChange,
  onRemoveAllNotes,
  onRemoveNote,
  reUploadNote,
  handleReUploadNote,
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
  const handleUpload = useCallback(
    (files: File[]) => {
      if (files.length) {
        onRemoveAllNotes?.();
        setNotes({});
        setFile(files[0]);
      }
    },
    [onRemoveAllNotes]
  );

  const handleRemoveAllNotes = useCallback(() => {
    setFile(undefined);
    setNotes({});
    onRemoveAllNotes?.();
  }, [onRemoveAllNotes]);

  // useMemo for note size
  const noteSize = useMemo(() => Object.keys(notes).length, [notes]);

  /**
   * Parse JSON string and return error if any
   * @param str - The JSON string to parse
   * @returns [error, parsed]
   */
  const parseJSON = useCallback((str: string) => {
    try {
      return [null, JSON.parse(str)];
    } catch (err) {
      return [err];
    }
  }, []);

  // Effect run when file changes
  useEffect(() => {
    async function processFile() {
      if (reUploadNote) {
        handleRemoveAllNotes();
        handleReUploadNote();
        return;
      }

      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = async () => {
        const text = reader.result as string;

        const [err, parsedNote] = parseJSON(text);

        if (err) {
          notificationApi({
            variant: 'error',
            message: 'Invalid note format',
          });
          return;
        }

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
              setProgress(((index + 1) / notes.length) * 100);
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
  }, [
    file,
    onNotesChange,
    reUploadNote,
    handleRemoveAllNotes,
    handleReUploadNote,
    parseJSON,
  ]);

  return (
    <>
      {!noteSize && <FileUploadArea onDrop={handleUpload} />}

      {!!file && (
        <FileUploadList>
          <FileUploadItem
            Icon={
              <div className="flex items-center justify-center w-6 h-6 rounded bg-mono-180">
                <KeyIcon className="!fill-mono-0" />
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
            onRemove={handleRemoveAllNotes}
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
                onRemove={() => {
                  setNotes((prev) => {
                    const { [id]: _, ...rest } = prev;
                    return rest;
                  });
                  onRemoveNote?.(id);
                }}
              />
            );
          })}
        </FileUploadList>
      ) : null}
    </>
  );
};
