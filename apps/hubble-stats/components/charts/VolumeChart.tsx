'use client';

import { FC } from 'react';
import { ResponsiveContainer, BarChart, XAxis, Tooltip, Bar } from 'recharts';
import { useNextDarkMode as useDarkMode } from '@webb-tools/webb-ui-components';

import { ChartTooltip } from '..';
import { VolumeChartProps } from './types';

const VolumeChart: FC<VolumeChartProps> = ({
  data,
  setValue,
  setDate,
  width = '100%',
  height = 180,
  tooltipValuePrefix = '',
  tooltipValueSuffix = '',
}) => {
  const [isDarkMode] = useDarkMode();

  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart
        data={data}
        onMouseLeave={() => {
          setValue && setValue(null);
          setDate && setDate(null);
        }}
        barGap={0}
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
          cursor={{ opacity: isDarkMode ? 0.2 : 1 }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              setValue && setValue(payload[0].payload['deposit']);
              setDate && setDate(payload[0].payload['date']);
              return (
                <ChartTooltip
                  date={payload[0].payload['date']}
                  info={[
                    {
                      color: '#624FBE',
                      label: 'Deposits',
                      value: payload[0].payload['deposit'],
                      valuePrefix: tooltipValuePrefix,
                      valueSuffix: tooltipValueSuffix,
                    },
                    {
                      color: '#B5A9F2',
                      label: 'Withdrawals',
                      value: payload[0].payload['withdrawal'],
                      valuePrefix: tooltipValuePrefix,
                      valueSuffix: tooltipValueSuffix,
                    },
                  ]}
                />
              );
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
