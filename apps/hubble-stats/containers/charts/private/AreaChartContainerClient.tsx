'use client';

import { useState } from 'react';
import { ChartContainer } from '@webb-tools/webb-ui-components/components/ChartContainer';

import { AreaChartContainerProps } from './types';
import AreaChart from '../../../components/charts/AreaChart';

export default function AreaChartContainerClient(
  props: AreaChartContainerProps
) {
  const { defaultValue, data } = props;

  const [value, setValue] = useState<number | null>(null);
  const [date, setDate] = useState<Date | null>(null);

  return (
    <ChartContainer
      heading="TVL"
      defaultValue={defaultValue}
      value={value}
      date={date}
      valueSuffix=" webbtTNT"
      className="bg-glass dark:bg-glass_dark"
    >
      <AreaChart
        data={data}
        setDate={setDate}
        setValue={setValue}
        tooltipLabel="TVL"
        tooltipValueSuffix=" webbtTNT"
      />
    </ChartContainer>
  );
}
