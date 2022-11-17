import { FileUploadLine } from '@webb-tools/icons';
import cx from 'classnames';
import { forwardRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography/Typography';
import { Button } from '../Button';
import { FileUploadAreaProps } from './types';

export const FileUploadArea = forwardRef<HTMLDivElement, FileUploadAreaProps>(
  (
    {
      className,
      onDrop,
      accept = { 'application/json': ['.json'] },
      maxSize = 1024 * 1024 * 50, // 50MB
      maxFiles = 1,
      ...props
    },
    ref
  ) => {
    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
      noClick: true,
      accept,
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
              'w-full rounded-lg max-w-[356px] h-[168px]',
              isDragActive
                ? 'bg-mono-20 dark:bg-mono-120'
                : 'bg-mono-0 dark:bg-mono-160',
              'border border-dashed border-mono-80 dark:border-mono-100',
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

          <Typography
            ta="center"
            className="text-mono-120 dark:text-mono-60"
            variant="body3"
          >
            JSON only (maximum file size 50 MB)
          </Typography>
        </div>

        <input hidden {...getInputProps({ className: 'hidden' })} />
      </div>
    );
  }
);
