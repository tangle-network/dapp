import { KeyIcon } from '@webb-tools/icons';
import {
  FileUploadArea,
  FileUploadList,
  Progress,
  Typography,
  getHumanFileSize,
} from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { Dispatch, FC, SetStateAction, useCallback } from 'react';
import { FileUploadItem } from '../../../../../../../../libs/webb-ui-components/src/components/FileUploads/FileUploadItem';

type FileUploadAreaWithListProps = {
  file: File | null;
  title: string;
  filename: string;
  setFile: Dispatch<SetStateAction<File | null>>;
};

const FileUploadAreaWithList: FC<FileUploadAreaWithListProps> = ({
  file,
  title,
  filename,
  setFile,
}) => {
  const handleFileUpload = useCallback(
    (acceptedFiles: File[]) => {
      // The uploaded file was not accepted; reset the state.
      if (acceptedFiles.length === 0) {
        setFile(null);

        return;
      }

      assert(
        acceptedFiles.length === 1,
        'Upload file dialog should allow exactly one file to be provided'
      );

      const uploadedFile = acceptedFiles[0];

      setFile(uploadedFile);
    },
    [setFile]
  );

  return (
    <>
      <FileUploadArea onDrop={handleFileUpload} />

      {file !== null && (
        <div className="flex flex-col gap-4">
          <Typography variant="body1" fw="semibold">
            {title} for {filename}:
          </Typography>

          <FileUploadList>
            <FileUploadItem
              fileName={file.name}
              onRemove={() => setFile(null)}
              Icon={
                <div className="flex items-center justify-center w-6 h-6 rounded bg-mono-180">
                  <KeyIcon className="!fill-mono-0" />
                </div>
              }
              extraInfo={
                <>
                  <Typography
                    className="text-mono-120 dark:text-mono-80"
                    variant="body1"
                  >
                    {getHumanFileSize(file.size, true, 0)}
                  </Typography>

                  <Progress className="mt-1" value={5.3} />
                </>
              }
            />
          </FileUploadList>
        </div>
      )}
    </>
  );
};

export default FileUploadAreaWithList;
