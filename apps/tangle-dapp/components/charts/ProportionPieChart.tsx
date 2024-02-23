'use client';

import {
  getRoundedAmountString,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { twMerge } from 'tailwind-merge';

import ChartTooltip from './ChartTooltip';
import type { ProportionPieChartProps } from './types';

const ProportionPieChart: FC<ProportionPieChartProps> = ({
  data,
  title,
  showTotal = false,
  unit,
}) => {
  return (
    <div className="relative">
      <PieChart width={200} height={200}>
        <Pie
          data={data}
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((item, index) => (
            <Cell key={`cell-${index}`} fill={item.color} />
          ))}
        </Pie>

        <Tooltip content={ChartTooltip} />
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
