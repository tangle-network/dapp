'use client';

import { FC } from 'react';
import { ResponsiveContainer, BarChart, XAxis, Tooltip, Bar } from 'recharts';

import { VolumeChartProps } from './types';

const VolumeChart: FC<VolumeChartProps> = ({
  data,
  setValue,
  setDate,
  width = '100%',
  height = 180,
}) => {
  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart
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
        <Bar dataKey="deposit" fill="#624FBE" />
        <Bar dataKey="withdrawal" fill="#B5A9F2" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default VolumeChart;
