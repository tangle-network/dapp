import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { EMPTY_VALUE_PLACEHOLDER } from '../../constants';

export type PercentageCellProps = {
  percentage?: number;
};

const PercentageCell: FC<PercentageCellProps> = ({ percentage }) => {
  if (percentage === undefined) {
    return EMPTY_VALUE_PLACEHOLDER;
  }

  return (
    <Typography
      variant="body2"
      fw="normal"
      className="text-mono-200 dark:text-mono-0"
    >
      {`${percentage.toFixed(2)}%`}
    </Typography>
  );
};

export default PercentageCell;
