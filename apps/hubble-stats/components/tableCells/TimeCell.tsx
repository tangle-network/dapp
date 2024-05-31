import { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '@webb-tools/webb-ui-components';

import { TimeCellProps } from './types';

const TimeCell: FC<TimeCellProps> = ({ time, className }) => {
  return (
    <Typography
      variant="body1"
      className={twMerge(
        'text-mono-140 dark:text-mono-40 whitespace-nowrap',
        className,
      )}
    >
      {time ?? '-'}
    </Typography>
  );
};

export default TimeCell;
