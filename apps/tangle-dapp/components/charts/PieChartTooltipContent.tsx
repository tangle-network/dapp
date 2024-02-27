import {
  getRoundedAmountString,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import type { PirChartTooltipContentProps } from './types';

const PieChartTooltipContent: FC<PirChartTooltipContentProps> = ({
  name,
  value,
  suffix,
}) => {
  return (
    <div className="px-4 py-2 rounded-lg bg-mono-0 dark:bg-mono-180 text-mono-120 dark:text-mono-80">
      <Typography variant="body2" fw="semibold" className="whitespace-nowrap">
        {name}:{' '}
        {typeof value === 'number' && value >= 10000
          ? getRoundedAmountString(value)
          : value}{' '}
        {suffix ? suffix : ''}
      </Typography>
    </div>
  );
};

export default PieChartTooltipContent;
