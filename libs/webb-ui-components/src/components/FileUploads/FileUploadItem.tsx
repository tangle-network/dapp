import { noop } from '@tanstack/react-table';
import { Close } from '@webb-tools/icons';
import cx from 'classnames';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography/Typography';
import { shortenString } from '../../utils';
import { FileUploadItemProps } from './types';

export const FileUploadItem = forwardRef<HTMLLIElement, FileUploadItemProps>(
  (
    {
      className,
      Icon,
      fileName = 'Untitled',
      extraInfo,
      onRemove = noop,
      ...props
    },
    ref
  ) => {
    return (
      <li
        {...props}
        className={twMerge(
          cx(
            'flex space-x-2',
            'p-2 rounded-lg bg-mono-0 dark:bg-mono-160',
            'border border-mono-80 dark:border-mono-100',
            'hover:bg-mono-20 dark:hover:bg-mono-120',
            'hover:border-mono-100 dark:hover:border-mono-60'
          ),
          className
        )}
        ref={ref}
      >
        <div>{Icon}</div>

        <div className="space-y-0.5 grow">
          <div className="flex items-start justify-between">
            <Typography variant="body1">
              {shortenString(fileName, 10)}
            </Typography>

            <button onClick={onRemove}>
              <Close />
            </button>
          </div>

          {extraInfo}
        </div>
      </li>
    );
  }
);
