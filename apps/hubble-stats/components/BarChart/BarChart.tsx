'use client';

import { FC } from 'react';
import {
  ResponsiveContainer,
  BarChart as BarChartCmp,
  XAxis,
  Tooltip,
  Bar,
} from 'recharts';
import { BarChartProps } from './types';

const BarChart: FC<BarChartProps> = ({
  data,
  setValue,
  setDate,
  isDarkMode,
  width = '100%',
  height = 180,
}) => {
  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChartCmp
        data={data}
        onMouseLeave={() => {
          setValue && setValue(null);
          setDate && setDate(null);
        }}
      >
        <XAxis
          dataKey="date"
          tickFormatter={(date) =>
            new Date(date).toLocaleDateString('en-US', {
              day: 'numeric',
            })
          }
          strokeOpacity={0}
          tick={{
            fontSize: '16px',
            fill: '#9CA0B0',
            fontWeight: 400,
          }}
          tickMargin={16}
        />
        <Tooltip
          contentStyle={{ display: 'none' }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              setValue && setValue(payload[0].payload['value']);
              setDate && setDate(payload[0].payload['date']);
            }

            return null;
          }}
        />
        <Bar dataKey="value" fill={isDarkMode ? '#81B3F6' : '#3D7BCE'} />
      </BarChartCmp>
    </ResponsiveContainer>
  );
};

export default BarChart;
