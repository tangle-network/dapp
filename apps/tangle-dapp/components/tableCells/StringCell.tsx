import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { StringCellProps } from './types';

const StringCell: FC<StringCellProps> = ({ value, className }) => {
  return (
    <Typography
      variant="body1"
      fw="normal"
      className={twMerge(
        'text-mono-140 dark:text-mono-40 whitespace-nowrap',
        className
      )}
    >
      {value}
    </Typography>
  );
};

export default StringCell;
