'use client';

import {
  getRoundedAmountString,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { twMerge } from 'tailwind-merge';

import { TANGLE_TOKEN_UNIT } from '../../constants';
import type { PieChartProps } from './types';

const IndependentRoleDistributionChart: FC<PieChartProps> = ({
  data,
  title = 'Independent',
}) => {
  return (
    <div className="relative">
      <PieChart width={200} height={200}>
        <Pie
          data={data}
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((item, index) => (
            <Cell key={`cell-${index}`} fill={item.color} stroke="none" />
          ))}
        </Pie>

        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <TooltipContent
                  name={payload[0].payload.name}
                  value={payload[0].payload.value}
                />
              );
            }
          }}
          wrapperStyle={{ zIndex: 100 }}
        />
      </PieChart>

      <div
        className={twMerge(
          'absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]',
          'flex flex-col items-center gap-1'
        )}
      >
        <Typography variant="body2">{title}</Typography>
        <Typography
          variant="body1"
          fw="bold"
          className="text-mono-200 dark:text-mono-0"
        >
          {getRoundedAmountString(
            data.reduce((acc, item) => acc + item.value, 0)
          )}{' '}
          {TANGLE_TOKEN_UNIT}
        </Typography>
      </div>
    </div>
  );
};

export default IndependentRoleDistributionChart;

/** @internal */
const TooltipContent: FC<{
  name: string;
  value: number;
}> = ({ name, value }) => {
  return (
    <div className="px-4 py-2 rounded-lg bg-mono-0 dark:bg-mono-180 text-mono-120 dark:text-mono-80">
      <Typography variant="body2" fw="semibold" className="whitespace-nowrap">
        {name}:{' '}
        {typeof value === 'number' && value >= 10000
          ? getRoundedAmountString(value)
          : value}{' '}
        {TANGLE_TOKEN_UNIT}
      </Typography>
    </div>
  );
};
