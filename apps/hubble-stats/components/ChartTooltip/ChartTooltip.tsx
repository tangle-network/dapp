import { FC } from 'react';
import { Typography } from '@webb-tools/webb-ui-components';

import { ChartTooltipProps } from './types';
import { getRoundedDownNumberWith2Decimals } from '../../utils';

const ChartTooltip: FC<ChartTooltipProps> = ({ date, info }) => {
  return (
    <div className="rounded-lg p-2 bg-[rgba(255,255,255,0.70)] dark:bg-[rgba(31,29,43,0.70)]">
      <Typography variant="body2">
        {new Date(date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </Typography>
      {info.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1">
          <div
            className="rounded-full w-2 h-2"
            style={{ backgroundColor: item.color }}
          />
          <Typography variant="body2">
            {item.label}: {item.valuePrefix ?? ''}
            {getRoundedDownNumberWith2Decimals(item.value)}
            {item.valueSuffix ?? ''}
          </Typography>
        </div>
      ))}
    </div>
  );
};

export default ChartTooltip;
