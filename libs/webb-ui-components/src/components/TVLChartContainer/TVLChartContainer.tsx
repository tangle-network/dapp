import { forwardRef } from 'react';
import { AreaChart, Area, XAxis, Tooltip } from 'recharts';
import { TVLChartContainerProps } from './types';
import { VolumeChartsContainerInfo } from '../VolumeChartsContainerInfo';

export const TVLChartContainer = forwardRef<
  HTMLDivElement,
  TVLChartContainerProps
>(
  (
    {
      currentTvlValue,
      tvlValue,
      setTvlValue,
      date,
      setDate,
      tvlData,
      isDarkMode,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className="bg-mono-0 dark:bg-mono-160 p-6 flex flex-col justify-between gap-4 border-2 rounded-lg  border-mono-0 dark:border-mono-160"
        ref={ref}
        {...props}
      >
        <VolumeChartsContainerInfo
          heading="TVL"
          value={`$${tvlValue ?? currentTvlValue}m`}
          date={date}
        />

        <AreaChart
          width={560}
          height={180}
          data={tvlData}
          onMouseLeave={() => {
            setDate && setDate(null);
            setTvlValue && setTvlValue(null);
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
                setTvlValue && setTvlValue(payload[0].payload['value']);
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
        </AreaChart>
      </div>
    );
  }
);
