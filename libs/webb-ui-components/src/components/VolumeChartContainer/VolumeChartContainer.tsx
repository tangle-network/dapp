import { forwardRef } from 'react';
import { BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { VolumeChartContainerProps } from './types';
import { VolumeChartsContainerInfo } from '../VolumeChartsContainerInfo';
import { Chip } from '../Chip';

export const VolumeChartContainer = forwardRef<
  HTMLDivElement,
  VolumeChartContainerProps
>(
  (
    {
      currentVolumeValue,
      volumeValue,
      setVolumeValue,
      volumeDate,
      setVolumeDate,
      volumeData,
      volumeDataType,
      setVolumeDataType,
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
        <div className="flex items-start justify-between">
          <VolumeChartsContainerInfo
            heading="Volume 24H"
            value={`$${volumeValue ?? currentVolumeValue}m`}
            date={volumeDate}
          />

          <div className="flex items-center gap-1">
            <Chip
              color="blue"
              className="cursor-pointer"
              isSelected={volumeDataType === 'Day'}
              onClick={() => setVolumeDataType('Day')}
            >
              D
            </Chip>
            <Chip
              color="blue"
              className="cursor-pointer"
              isSelected={volumeDataType === 'Week'}
              onClick={() => setVolumeDataType('Week')}
            >
              W
            </Chip>
            <Chip
              color="blue"
              className="cursor-pointer"
              isSelected={volumeDataType === 'Month'}
              onClick={() => setVolumeDataType('Month')}
            >
              M
            </Chip>
          </div>
        </div>

        <BarChart
          width={560}
          height={180}
          data={volumeData}
          onMouseLeave={() => {
            setVolumeDate && setVolumeDate(null);
            setVolumeDate && setVolumeDate(null);
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
                setVolumeValue && setVolumeValue(payload[0].payload['value']);
                setVolumeDate && setVolumeDate(payload[0].payload['date']);
              }

              return null;
            }}
          />
          <Bar dataKey="value" fill={isDarkMode ? '#81B3F6' : '#3D7BCE'} />
        </BarChart>
      </div>
    );
  }
);
