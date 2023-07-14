'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  TVLChartContainer,
  VolumeChartContainer,
} from '@webb-tools/webb-ui-components';

export const VolumeChartsContainer = () => {
  // Current TVLVolume & Volume values (Default values)
  const [currentTvlValue, setCurrentTvlValue] = useState<number>(13.6);
  const [currentVolumeValue, setCurrentVolumeValue] = useState<number>(8.56);

  // TVLVolume value & Set TVLVolume value (When user hover on chart - Tooltip response value)
  const [tvlValue, setTvlValue] = useState<number | null>(null);
  const [tvlDate, setTVLDate] = useState<Date | null>(null);

  // Volume value & Set Volume value (When user hover on chart - Tooltip response value)
  const [volumeDate, setVolumeDate] = useState<Date | null>(null);
  const [volumeValue, setVolumeValue] = useState<number | null>(null);

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
      <TVLChartContainer
        currentTvlValue={currentTvlValue}
        tvlValue={tvlValue}
        setTvlValue={setTvlValue}
        tvlDate={tvlDate}
        setTVLDate={setTVLDate}
        tvlData={tvlData}
        isDarkMode={isDarkMode}
      />

      <VolumeChartContainer
        currentVolumeValue={currentVolumeValue}
        volumeValue={volumeValue}
        setVolumeValue={setVolumeValue}
        volumeDate={volumeDate}
        setVolumeDate={setVolumeDate}
        volumeData={volumeData}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
