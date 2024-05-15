import { FileUploadLine } from '@webb-tools/icons';
import cx from 'classnames';
import { forwardRef } from 'react';
import { useDropzone, type Accept } from 'react-dropzone';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography/Typography';
import { Button } from '../buttons';
import type { FileUploadAreaProps, AcceptFileType } from './types';

const fileTypeMap: {
  [key in AcceptFileType]: Accept;
} = {
  // Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
  json: { 'application/json': ['.json'] },
  csv: { 'text/csv': ['.csv'] },
};

export const FileUploadArea = forwardRef<HTMLDivElement, FileUploadAreaProps>(
  (
    {
      className,
      onDrop,
      acceptType,
      maxSize = 1024 * 1024 * 50, // 50MB
      maxFiles = 1,
      ...props
    },
    ref
  ) => {
    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
      noClick: true,
      accept: acceptType ? fileTypeMap[acceptType] : undefined,
      maxSize,
      maxFiles,
      onDrop,
    });

    return (
      <div
        {...props}
        {...getRootProps({
          className: twMerge(
            cx(
              'w-full rounded-lg aspect-[2/1]',
              isDragActive
                ? 'bg-mono-20 dark:bg-mono-120'
                : 'bg-mono-0 dark:bg-mono-160',
              'border-2 border-dashed border-mono-80 dark:border-mono-100',
              'flex flex-col items-center justify-center',
              'space-y-8'
            ),
            className
          ),
        })}
        ref={ref}
      >
        <div>
          <FileUploadLine size="lg" />
        </div>

        <div className="space-y-1">
          <Typography
            className={cx(
              isDragActive
                ? 'text-mono-120 dark:text-mono-40'
                : 'text-mono-180 dark:text-mono-40'
            )}
            ta="center"
            variant="body1"
            fw="semibold"
          >
            <Button
              variant="link"
              as="span"
              className={cx(
                'inline-block',
                isDragActive
                  ? 'text-blue-40 dark:text-blue-50'
                  : 'text-blue-70 dark:text-blue-50'
              )}
              onClick={open}
            >
              Click to upload
            </Button>{' '}
            or drag and drop
          </Typography>

          {acceptType && (
            <Typography
              ta="center"
              className="text-mono-120 dark:text-mono-60"
              variant="body3"
            >
              {`${acceptType.toUpperCase()} only (maximum file size ${convertToFileSize(
                maxSize
              )})`}
            </Typography>
          )}
        </div>

        <input hidden {...getInputProps({ className: 'hidden' })} />
      </div>
    );
  }
);

/** @internal */
/**
 * Converts a number into a string representation of a file size.
 *
 * @param number - The number to convert.
 * @returns The string representation of the file size.
 */
function convertToFileSize(number: number): string {
  const suffixes: string[] = ['B', 'KB', 'MB', 'GB', 'TB'];
  let index = 0;

  while (number >= 1024 && index < suffixes.length - 1) {
    number /= 1024;
    index++;
  }

  const formattedNumber: string =
    number % 1 === 0 ? number.toFixed(0) : number.toFixed(2);
  const formattedSuffix: string = index === 0 ? '' : suffixes[index];

  return `${formattedNumber} ${formattedSuffix}`;
}
