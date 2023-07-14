'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  DaysFilterType,
  VolumeChartWrapper,
} from '@webb-tools/webb-ui-components';
import { Area, AreaChart, Bar, BarChart, Tooltip, XAxis } from 'recharts';

export const VolumeChartsContainer = () => {
  // Current TVLVolume & Volume values (Default values)
  const [currentTvlValue, setCurrentTvlValue] = useState<number>(13.6);
  const [currentVolumeValue, setCurrentVolumeValue] = useState<number>(8.56);

  // TVLVolume value & Set TVLVolume value (When user hover on chart - Tooltip response value)
  const [tvlValue, setTvlValue] = useState<number | null>(null);
  const [tvlDate, setTVLDate] = useState<Date | null>(null);

  // 24 Hour Volume value & Set Volume value (When user hover on chart - Tooltip response value)
  const [volumeDate, setVolumeDate] = useState<Date | null>(null);
  const [volumeValue, setVolumeValue] = useState<number | null>(null);

  // 24 Hour Volume data type (day, week, month) - Default value is Week
  const [volumeDataType, setVolumeDataType] = useState<DaysFilterType>('week');

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(localStorage.getItem('theme') === 'dark');
    };

    handleThemeChange();

    window.addEventListener('storage', handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleThemeChange);
    };
  }, []);

  const tvlData = useMemo(() => {
    const data = [];

    for (let i = 0; i < 100; i++) {
      data.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        value: Math.floor(Math.random() * 20) + 1,
      });
    }

    return data;
  }, []);

  const volumeData = useMemo(() => {
    const data = [];

    for (let i = 0; i < 100; i++) {
      data.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        value: Math.floor(Math.random() * 20) + 1,
      });
    }

    return data;
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* TVL Chart Container */}
      <VolumeChartWrapper
        currentValue={currentTvlValue}
        value={tvlValue}
        date={tvlDate}
      >
        <AreaChart
          width={560}
          height={180}
          data={tvlData}
          onMouseLeave={() => {
            setTVLDate && setTVLDate(null);
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
                setTVLDate && setTVLDate(payload[0].payload['date']);
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
      </VolumeChartWrapper>

      {/* 24 Hour Volume Chart Container */}
      <VolumeChartWrapper
        currentValue={currentVolumeValue}
        value={volumeValue}
        date={volumeDate}
        filterType="days"
        daysFilterType={volumeDataType}
        setDaysFilterType={setVolumeDataType}
      >
        <BarChart
          width={560}
          height={180}
          data={volumeData}
          onMouseLeave={() => {
            setVolumeValue && setVolumeValue(null);
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
      </VolumeChartWrapper>
    </div>
  );
};
