'use client';

import { BN, BN_ZERO } from '@polkadot/util';
import { Typography, useNextDarkMode } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { twMerge } from 'tailwind-merge';

import useFormatNativeTokenAmount from '../../hooks/useFormatNativeTokenAmount';
import type { PieChartProps } from './types';
import { formatDataForPieCharts } from './utils';

const IndependentRoleDistributionChart: FC<PieChartProps> = ({
  data,
  title = 'Independent',
}) => {
  const [isDarkMode] = useNextDarkMode();
  const formatNativeTokenAmount = useFormatNativeTokenAmount();

  const hasData = data.length > 0;

  const dataOrDefault = hasData
    ? formatDataForPieCharts(data)
    : [{ value: 1, color: isDarkMode ? '#3A3E53' : '#D3D8E2' }];

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
                  value={formatNativeTokenAmount(payload[0].payload.value)}
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
          {formatNativeTokenAmount(
            data.reduce((acc, item) => acc.add(new BN(item.value)), BN_ZERO)
          )}
        </Typography>
      </div>
    </div>
  );
};

export default IndependentRoleDistributionChart;

/** @internal */
const TooltipContent: FC<{
  name: string;
  value: string;
}> = ({ name, value }) => {
  return (
    <div className="px-4 py-2 rounded-lg bg-mono-0 dark:bg-mono-180 text-mono-120 dark:text-mono-80">
      <Typography variant="body2" fw="semibold" className="whitespace-nowrap">
        {name}: {value}
      </Typography>
    </div>
  );
};
