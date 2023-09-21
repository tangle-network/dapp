'use client';

import { FC } from 'react';
import {
  ResponsiveContainer,
  BarChart as BarChartCmp,
  XAxis,
  Tooltip,
  Bar,
} from 'recharts';
import { useNextDarkMode as useDarkMode } from '@webb-tools/webb-ui-components';

import ChartTooltipContent from './ChartToolTipContent';
import { BarChartProps } from './types';

const BarChart: FC<BarChartProps> = ({
  data,
  setValue,
  setDate,
  width = '100%',
  height = 180,
  fillColor: color = 'blue',
  showTooltip = true,
  tooltipLabel = '',
  tooltipValuePrefix = '',
  tooltipValueSuffix = '',
}) => {
  const [isDarkMode] = useDarkMode();

  let fillColor: string;
  switch (color) {
    case 'blue':
      fillColor = isDarkMode ? '#81B3F6' : '#3D7BCE';
      break;
    case 'purple':
      fillColor = '#B5A9F2';
  }

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
          interval="preserveStartEnd"
        />
        {showTooltip && (
          <Tooltip
            content={({ active, payload }) => {
              return (
                <ChartTooltipContent
                  date={payload?.[0]?.payload['date']}
                  info={[
                    {
                      color: fillColor,
                      label: tooltipLabel,
                      value: payload?.[0]?.payload['value'],
                      valuePrefix: tooltipValuePrefix,
                      valueSuffix: tooltipValueSuffix,
                    },
                  ]}
                  onContentDisplayedFnc={() => {
                    setValue && setValue(payload?.[0]?.payload['value']);
                    setDate && setDate(payload?.[0]?.payload['date']);
                  }}
                  hide={!showTooltip || !(active && payload && payload.length)}
                />
              );
            }}
          />
        )}
        <Bar dataKey="value" fill={fillColor} />
      </BarChartCmp>
    </ResponsiveContainer>
  );
};

export default BarChart;
