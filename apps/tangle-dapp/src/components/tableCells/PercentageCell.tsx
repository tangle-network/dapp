import { Typography } from '@tangle-network/ui-components';
import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components/constants';
import formatPercentage from '@tangle-network/ui-components/utils/formatPercentage';
import { FC } from 'react';

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
      {formatPercentage(percentage)}
    </Typography>
  );
};

export default PercentageCell;
