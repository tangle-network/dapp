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
    <Typography
      variant="body1"
      className={twMerge(
        'text-mono-140 dark:text-mono-40 text-center',
        className
      )}
    >
      {typeof value === 'number' && (prefix ?? '')}
      {isProtected
        ? '****'
        : getRoundedAmountString(value, 2, {
            roundingFunction: Math.floor,
            totalLength: 0,
          })}
      {typeof value === 'number' && (suffix ? ` ${suffix}` : '')}
    </Typography>
  );
};

export default NumberCell;
