'use client';

import { useEffect, useMemo, useState } from 'react';
import { DaysFilterType, ChartContainer } from '@webb-tools/webb-ui-components';
import { AreaChart, BarChart } from '../../components';

const OverviewChartsContainer = () => {
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
      <ChartContainer
        heading="TVL"
        currentValue={currentTvlValue}
        value={tvlValue}
        date={tvlDate}
      >
        <AreaChart
          data={tvlData}
          setDate={setTVLDate}
          setValue={setTvlValue}
          isDarkMode={isDarkMode}
        />
      </ChartContainer>

      {/* 24 Hour Volume Chart Container */}
      <ChartContainer
        heading="Volume 24H"
        currentValue={currentVolumeValue}
        value={volumeValue}
        date={volumeDate}
        filterType="days"
        daysFilterType={volumeDataType}
        setDaysFilterType={setVolumeDataType}
      >
        <BarChart
          data={volumeData}
          setDate={setVolumeDate}
          setValue={setVolumeValue}
          isDarkMode={isDarkMode}
        />
      </ChartContainer>
    </div>
  );
};

export default OverviewChartsContainer;
