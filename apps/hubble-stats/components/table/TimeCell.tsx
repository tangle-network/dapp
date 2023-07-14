import { FC } from 'react';
import cx from 'classnames';
import { Typography } from '@webb-tools/webb-ui-components';

import { TimeCellProps } from './types';

const TimeCell: FC<TimeCellProps> = ({ time, className }) => {
  return (
    <Typography
      variant="body1"
      className={cx('text-mono-140 dark:text-mono-40', className)}
    >
      {time ? 'Today' : '-'}
    </Typography>
  );
};

export default TimeCell;
