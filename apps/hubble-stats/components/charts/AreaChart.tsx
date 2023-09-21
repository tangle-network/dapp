'use client';

import { FC, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart as AreaChartCmp,
  Area,
  Tooltip,
  XAxis,
} from 'recharts';
import { useNextDarkMode as useDarkMode } from '@webb-tools/webb-ui-components';

import ChartTooltipContent from './ChartToolTipContent';
import { AreaChartProps } from './types';

const AreaChart: FC<AreaChartProps> = ({
  data,
  setDate,
  setValue,
  width = '100%',
  height = 180,
  showTooltip = true,
  tooltipLabel = '',
  tooltipValuePrefix = '',
  tooltipValueSuffix = '',
}) => {
  const [isDarkMode] = useDarkMode();

  const fillColor = useMemo(
    () => (isDarkMode ? '#C6BBFA' : '#624FBE'),
    [isDarkMode]
  );

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
        {showTooltip && (
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <ChartTooltipContent
                    date={payload[0].payload['date']}
                    info={[
                      {
                        color: fillColor,
                        label: tooltipLabel,
                        value: payload[0].payload['value'],
                        valuePrefix: tooltipValuePrefix,
                        valueSuffix: tooltipValueSuffix,
                      },
                    ]}
                    onContentDisplayedFnc={() => {
                      setValue && setValue(payload[0].payload['value']);
                      setDate && setDate(payload[0].payload['date']);
                    }}
                  />
                );
              }
              return null;
            }}
          />
        )}
        <Area
          dataKey="value"
          stroke={fillColor}
          fillOpacity={0}
          strokeWidth={2}
        />
      </AreaChartCmp>
    </ResponsiveContainer>
  );
};

export default AreaChart;
