import { Button, Typography } from '@webb-tools/webb-ui-components';
import { twMerge } from 'tailwind-merge';

import { TableStatusProps } from './types';

const TableStatus = ({
  title,
  description,
  icon,
  buttonText,
  buttonProps,
  className,
}: TableStatusProps) => {
  return (
    <div
      className={twMerge(
        'rounded-lg border border-mono-40 dark:border-mono-160',
        'bg-mono-0 dark:bg-mono-180',
        'flex flex-col items-center justify-center gap-6 p-4',
        className,
      )}
    >
      <div className="flex flex-col items-center justify-center gap-2 pt-4">
        {icon}

        <Typography
          variant="h5"
          fw="bold"
          className="text-center text-mono-200 dark:text-mono-0"
        >
          {title}
        </Typography>

        <Typography
          variant="body1"
          fw="semibold"
          className="max-w-2xl text-center text-mono-120 dark:text-mono-80"
        >
          {description}
        </Typography>
      </div>

      {buttonText && (
        <span className="pb-4">
          <Button {...buttonProps}>{buttonText}</Button>
        </span>
      )}
    </div>
  );
};

export default TableStatus;
