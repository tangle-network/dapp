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
        'bg-mono-0 dark:bg-mono-180 h-[228px]',
        'flex flex-col items-center justify-center gap-6 p-8',
        className
      )}
    >
      <div className="flex flex-col items-center justify-center gap-2 pt-4">
        {icon}
        <Typography
          variant="h5"
          fw="bold"
          className="text-mono-200 dark:text-mono-0 text-center"
        >
          {title}
        </Typography>
        <Typography
          variant="body1"
          fw="semibold"
          className="text-mono-120 dark:text-mono-80 text-center"
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
