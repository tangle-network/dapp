import { InformationLine } from '@webb-tools/icons';
import cx from 'classnames';
import { FC, useCallback, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography/Typography';
import { Button } from '../Button';
import { FileUploadFieldProps } from './types';

export const FileUploadField: FC<FileUploadFieldProps> = ({
  error,
  onChange,
  onUpload,
  value,
}) => {
  // State for the note value
  const [note, setNote] = useState(value);

  // State for uploading note
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setNote(value);
  }, [value]);

  // Handle change event
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNote(value);
    onChange?.(value);
  }, []);

  // Handle upload event
  const handleUpload = useCallback(async () => {
    setIsUploading(true);
    await onUpload?.(note ?? '');
    setIsUploading(false);
  }, [note]);

  return (
    <div className="space-y-2">
      <div
        className={twMerge(
          'w-full max-w-[356px]',
          'p-3 rounded-md bg-mono-20 dark:bg-mono-120',
          'flex items-center justify-between space-x-5'
        )}
      >
        <input
          value={note}
          onChange={handleChange}
          placeholder="webb://...."
          className={cx(
            'bg-transparent mono1 text-mono-200 dark:text-mono-0',
            'placeholder:text-mono-120 dark:placeholder:text-mono-80',
            'disabled:text-mono-120 dark:disabled:text-mono-80',
            'grow focus:outline-0'
          )}
        />

        <Button
          isDisabled={!note}
          variant="utility"
          size="sm"
          onClick={handleUpload}
          isLoading={isUploading}
        >
          Upload
        </Button>
      </div>

      {error && (
        <div className="flex items-center space-x-1 text-red-50">
          <InformationLine className="!fill-current" />

          <Typography className="!text-current" variant="body1">
            {error}
          </Typography>
        </div>
      )}
    </div>
  );
};
