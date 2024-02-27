'use client';

import {
  getRoundedAmountString,
  Typography,
  useNextDarkMode,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { twMerge } from 'tailwind-merge';

import PieChartTooltipContent from './PieChartTooltipContent';
import type { ProportionPieChartProps } from './types';

const ProportionPieChart: FC<ProportionPieChartProps> = ({
  data,
  title,
  showTotal = false,
  unit,
}) => {
  const [isDarkMode] = useNextDarkMode();

  const hasData = data.length > 0;

  const dataOrDefault = hasData
    ? data
    : [{ value: 1, color: isDarkMode ? '#3A3E53' : '#D3D8E2' }];

  return (
    <div className="relative">
      <PieChart width={200} height={200}>
        <Pie
          data={dataOrDefault}
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={hasData ? 5 : 0}
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
                <PieChartTooltipContent
                  name={payload[0].payload.name}
                  value={payload[0].payload.value}
                  suffix={unit}
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
        {title && <Typography variant="body2">{title}</Typography>}
        {showTotal && (
          <Typography
            variant="body1"
            fw="bold"
            className="text-mono-200 dark:text-mono-0"
          >
            {getRoundedAmountString(
              data.reduce((acc, item) => acc + item.value, 0)
            )}{' '}
            {unit}
          </Typography>
        )}
      </div>
    </div>
  );
};

export default ProportionPieChart;
