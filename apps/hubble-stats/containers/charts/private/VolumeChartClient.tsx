'use client';

import { ChartContainer } from '@webb-tools/webb-ui-components';
import { useState } from 'react';
import VolumeChart from '../../../components/charts/VolumeChart';
import getFormattedDataForVolumeChart from '../../../utils/getFormattedDataForVolumeChart';

export default function VolumeChartClient(props: {
  deposit24h?: number;
  volumeData: ReturnType<typeof getFormattedDataForVolumeChart>;
}) {
  const { deposit24h, volumeData } = props;

  const [volumeValue, setVolumeValue] = useState<number | null>(null);
  const [volumeDate, setVolumeDate] = useState<Date | null>(null);

  return (
    <ChartContainer
      heading="Volume 24H"
      currentValue={deposit24h}
      value={volumeValue}
      date={volumeDate}
      valueSuffix=" webbtTNT"
      className="bg-glass dark:bg-glass_dark"
    >
      <VolumeChart
        data={volumeData}
        setDate={setVolumeDate}
        setValue={setVolumeValue}
        tooltipValueSuffix=" webbtTNT"
      />
    </ChartContainer>
  );
}
