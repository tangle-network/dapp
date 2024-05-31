'use client';

import { useState } from 'react';
import { ChartContainer } from '@webb-tools/webb-ui-components';

import { VolumeChartContainerProps } from './types';
import VolumeChart from '../../../components/charts/VolumeChart';

export default function VolumeChartContainerClient(
  props: VolumeChartContainerProps,
) {
  const { deposit24h, data, heading } = props;

  const [volumeValue, setVolumeValue] = useState<number | null>(null);
  const [volumeDate, setVolumeDate] = useState<Date | null>(null);

  return (
    <ChartContainer
      heading={heading}
      defaultValue={deposit24h}
      value={volumeValue}
      date={volumeDate}
      valueSuffix=" webbtTNT"
      className="bg-glass dark:bg-glass_dark"
    >
      <VolumeChart
        data={data}
        setDate={setVolumeDate}
        setValue={setVolumeValue}
        tooltipValueSuffix=" webbtTNT"
      />
    </ChartContainer>
  );
}
