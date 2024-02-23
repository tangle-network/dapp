'use client';

import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { twMerge } from 'tailwind-merge';

import ChartTooltip from './ChartTooltip';
import type { ProportionPieChartProps } from './types';

const ProportionPieChart: FC<ProportionPieChartProps> = ({
  data,
  title,
  calculateTotal = false,
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
          'absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] space-y-2'
        )}
      >
        {title && <Typography variant="body2">{title}</Typography>}
        {calculateTotal && (
          <Typography variant="h4" fw="bold">
            Total: {data.reduce((acc, item) => acc + item.value, 0)} {unit}
          </Typography>
        )}
      </div>
    </div>
  );
};

export default ProportionPieChart;
