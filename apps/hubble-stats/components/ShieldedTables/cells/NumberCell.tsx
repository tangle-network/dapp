import { FC } from 'react';
import cx from 'classnames';
import { Typography } from '@webb-tools/webb-ui-components';
import { getRoundedAmountString } from '@webb-tools/webb-ui-components/utils';

interface HeaderCellProps {
  value?: number;
  prefix?: string;
  className?: string;
}

export const NumberCell: FC<HeaderCellProps> = ({
  value,
  prefix,
  className,
}) => {
  return (
    <Typography
      variant="body1"
      className={cx('text-mono-140 text-center uppercase', className)}
    >
      {value && (prefix ?? '')}
      {typeof value === 'number' && value < 10000
        ? value
        : getRoundedAmountString(value, 2, {
            roundingFunction: Math.floor,
            totalLength: 0,
          })}
    </Typography>
  );
};
