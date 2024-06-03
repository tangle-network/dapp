'use client';

import { useState } from 'react';
import { ChartContainer } from '@webb-tools/webb-ui-components/components/ChartContainer';

import { BarChartContainerProps } from './types';
import BarChart from '../../../components/charts/BarChart';

export default function AreaChartContainerClient(
  props: BarChartContainerProps,
) {
  const { defaultValue, data, heading } = props;

  const [value, setValue] = useState<number | null>(null);
  const [date, setDate] = useState<Date | null>(null);

  return (
    <ChartContainer
      heading={heading}
      defaultValue={defaultValue}
      value={value}
      date={date}
      valueSuffix=" webbtTNT"
      className="bg-glass dark:bg-glass_dark"
    >
      <BarChart
        data={data}
        setDate={setDate}
        setValue={setValue}
        tooltipLabel={heading}
        tooltipValueSuffix=" webbtTNT"
      />
    </ChartContainer>
  );
}
