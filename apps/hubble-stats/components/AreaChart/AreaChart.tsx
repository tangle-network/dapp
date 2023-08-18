'use client';

import { FC } from 'react';
import {
  ResponsiveContainer,
  AreaChart as AreaChartCmp,
  Area,
  Tooltip,
  XAxis,
} from 'recharts';
import { useDarkMode } from '@webb-tools/webb-ui-components';

import { AreaChartProps } from './types';

const AreaChart: FC<AreaChartProps> = ({
  data,
  setDate,
  setValue,
  width = '100%',
  height = 180,
}) => {
  const [isDarkMode] = useDarkMode();

  return (
    <ResponsiveContainer width={width} height={height}>
      <AreaChartCmp
        data={data}
        onMouseLeave={() => {
          setDate && setDate(null);
          setValue && setValue(null);
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
          interval="preserveStartEnd"
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
        <Area
          dataKey="value"
          stroke={isDarkMode ? '#C6BBFA' : '#624FBE'}
          fillOpacity={0}
          strokeWidth={2}
        />
      </AreaChartCmp>
    </ResponsiveContainer>
  );
};

export default AreaChart;
