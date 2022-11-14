import { Key } from '@webb-tools/icons';
import { Note } from '@webb-tools/sdk-core';
import {
  FileUploadArea,
  FileUploadItem,
  FileUploadList,
  getHumanFileSize,
  Progress,
  TokenPairIcons,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useEffect, useState } from 'react';
import { UploadModalContentProps } from './types';

export const UploadModalContent: FC<UploadModalContentProps> = ({
  onNotesChange,
}) => {
  // State for uploaded file
  const [file, setFile] = useState<File | undefined>();

  // State for processed notes
  const [notes, setNotes] = useState<Note[]>([]);

  // State for note processing value
  const [progress, setProgress] = useState(0);

  // Event handler for uploading files
  const handleUpload = useCallback((files: File[]) => {
    console.log('Handle upload', files);
    if (files.length) {
      setFile(files[0]);
    }
  }, []);

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

      {notes && notes.length ? (
        <FileUploadList title={`Available notes: ${notes.length}`}>
          {notes.map((note, idx) => {
            console.warn('Needed to serialize note here to get the data', note);

            return (
              <FileUploadItem
                key={idx}
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
                    Note balance: 2.450
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
