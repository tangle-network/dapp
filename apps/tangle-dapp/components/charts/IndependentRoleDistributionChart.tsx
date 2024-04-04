'use client';

import {
  getRoundedAmountString,
  Typography,
  useNextDarkMode,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { twMerge } from 'tailwind-merge';

import useNetworkStore from '../../context/useNetworkStore';
import type { PieChartProps } from './types';

const IndependentRoleDistributionChart: FC<PieChartProps> = ({
  data,
  title = 'Independent',
}) => {
  const [isDarkMode] = useNextDarkMode();

  const hasData = data.length > 0;

  const dataOrDefault = hasData
    ? data
    : [{ value: 1, color: isDarkMode ? '#3A3E53' : '#D3D8E2' }];

  const { nativeTokenSymbol } = useNetworkStore();

  return (
    <div className="relative">
      <PieChart width={200} height={200}>
        <Pie
          data={dataOrDefault}
          innerRadius={60}
          fill="#8884d8"
          paddingAngle={hasData ? 5 : 0}
          outerRadius={100}
          dataKey="value"
        >
          {dataOrDefault.map((item, index) => (
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
                  tokenSymbol={nativeTokenSymbol}
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
          {nativeTokenSymbol}
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
  tokenSymbol: string;
}> = ({ name, value, tokenSymbol }) => {
  return (
    <div className="px-4 py-2 rounded-lg bg-mono-0 dark:bg-mono-180 text-mono-120 dark:text-mono-80">
      <Typography variant="body2" fw="semibold" className="whitespace-nowrap">
        {name}:{' '}
        {typeof value === 'number' && value >= 10000
          ? getRoundedAmountString(value)
          : value}{' '}
        {tokenSymbol}
      </Typography>
    </div>
  );
};
