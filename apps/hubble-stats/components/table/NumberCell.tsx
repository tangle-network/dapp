import { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '@webb-tools/webb-ui-components';
import { getRoundedAmountString } from '@webb-tools/webb-ui-components/utils';

import { NumberCellProps } from './types';

const NumberCell: FC<NumberCellProps> = ({
  value,
  prefix,
  suffix,
  isProtected = false,
  className,
}) => {
  return (
    <div
      className={twMerge('flex items-center gap-1 justify-center', className)}
    >
      <Typography variant="body1" className="text-mono-140 dark:text-mono-40">
        {typeof value === 'number' && (prefix ?? '')}
        {isProtected
          ? '****'
          : getRoundedAmountString(value, 2, {
              roundingFunction: Math.floor,
              totalLength: 0,
            })}
      </Typography>

      {typeof value === 'number' &&
        (suffix ? (
          <Typography
            variant="body2"
            className="text-mono-140 dark:text-mono-40"
          >
            {suffix}
          </Typography>
        ) : (
          ''
        ))}
    </div>
  );
};

export default NumberCell;
