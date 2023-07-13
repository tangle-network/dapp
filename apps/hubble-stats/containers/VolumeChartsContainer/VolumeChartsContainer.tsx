'use client';
import { useEffect, useMemo, useState } from 'react';
import { TVLChartContainer } from '@webb-tools/webb-ui-components';

export const VolumeChartsContainer = () => {
  const [currentTvlValue, setCurrentTvlValue] = useState<number>(13.6);
  const [tvlValue, setTvlValue] = useState<number | null>(null);
  const [date, setDate] = useState<Date | null>(null);
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
        value: Math.floor(Math.random() * 20),
      });
    }

    return data;
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <TVLChartContainer
          currentTvlValue={currentTvlValue}
          tvlValue={tvlValue}
          setTvlValue={setTvlValue}
          date={date}
          setDate={setDate}
          tvlData={tvlData}
          isDarkMode={isDarkMode}
        />
      </div>

      <div>{/* Volume Chart */}</div>
    </div>
  );
};
