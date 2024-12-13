import { Typography } from '@webb-tools/webb-ui-components';
import { EMPTY_VALUE_PLACEHOLDER } from '@webb-tools/webb-ui-components/constants';
import formatFractional from '@webb-tools/webb-ui-components/utils/formatFractional';
import { FC } from 'react';

export type PercentageCellProps = {
  fractional?: number;
};

const PercentageCell: FC<PercentageCellProps> = ({ fractional }) => {
  if (fractional === undefined) {
    return EMPTY_VALUE_PLACEHOLDER;
  }

  return (
    <Typography
      variant="body2"
      fw="normal"
      className="text-mono-200 dark:text-mono-0"
    >
      {formatFractional(fractional)}
    </Typography>
  );
};

export default PercentageCell;
