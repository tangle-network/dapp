'use client';

import { FC, useState } from 'react';
import { DaysFilterType, ChartContainer } from '@webb-tools/webb-ui-components';

import { AreaChart, BarChart } from '../../components';
import { OverviewChartsDataType } from '../../data';

const OverviewChartsCmp: FC<OverviewChartsDataType> = ({
  currentTvl,
  currentVolume,
  tvlData,
  volumeData,
}) => {
  const [tvlValue, setTvlValue] = useState<number | null>(null);
  const [tvlDate, setTVLDate] = useState<Date | null>(null);
  const [volumeValue, setVolumeValue] = useState<number | null>(null);
  const [volumeDate, setVolumeDate] = useState<Date | null>(null);
  const [volumeDataType, setVolumeDataType] = useState<DaysFilterType>('week');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* TVL Chart Container */}
      <ChartContainer
        heading="TVL"
        currentValue={currentTvl}
        value={tvlValue}
        date={tvlDate}
        className="bg-glass dark:bg-glass_dark"
      >
        <AreaChart data={tvlData} setDate={setTVLDate} setValue={setTvlValue} />
      </ChartContainer>

      {/* 24 Hour Volume Chart Container */}
      <ChartContainer
        heading="Volume 24H"
        currentValue={currentVolume}
        value={volumeValue}
        date={volumeDate}
        filterType="days"
        daysFilterType={volumeDataType}
        setDaysFilterType={setVolumeDataType}
        className="bg-glass dark:bg-glass_dark"
      >
        <BarChart
          data={volumeData}
          setDate={setVolumeDate}
          setValue={setVolumeValue}
        />
      </ChartContainer>
    </div>
  );
};

export default OverviewChartsCmp;
