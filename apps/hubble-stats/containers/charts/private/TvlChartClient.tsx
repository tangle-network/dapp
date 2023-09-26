'use client';

import { ChartContainer } from '@webb-tools/webb-ui-components/components/ChartContainer';
import { useState } from 'react';
import AreaChart from '../../../components/charts/AreaChart';
import getFormattedDataForBasicChart from '../../../utils/getFormattedDataForBasicChart';

export default function TvlChartClient(props: {
  currentTvl?: number;
  tvlData: ReturnType<typeof getFormattedDataForBasicChart>;
}) {
  const { currentTvl, tvlData } = props;

  const [tvlValue, setTvlValue] = useState<number | null>(null);
  const [tvlDate, setTVLDate] = useState<Date | null>(null);

  return (
    <ChartContainer
      heading="TVL"
      currentValue={currentTvl}
      value={tvlValue}
      date={tvlDate}
      valueSuffix=" webbtTNT"
      className="bg-glass dark:bg-glass_dark"
    >
      <AreaChart
        data={tvlData}
        setDate={setTVLDate}
        setValue={setTvlValue}
        tooltipLabel="TVL"
        tooltipValueSuffix=" webbtTNT"
      />
    </ChartContainer>
  );
}
