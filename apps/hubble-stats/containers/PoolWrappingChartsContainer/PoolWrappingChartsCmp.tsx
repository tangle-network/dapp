'use client';

import { FC, useState, useMemo } from 'react';
import {
  ChartContainer,
  TableAndChartTabs,
  TabContent,
} from '@webb-tools/webb-ui-components';

import { AreaChart, BarChart } from '../../components';
import { PoolWrappingChartsDataType } from '../../data';

const twlTab = 'TWL';
const wrappingFeesTab = 'Wrapping Fees 24H';

const PoolWrappingChartsCmp: FC<PoolWrappingChartsDataType> = ({
  twl,
  wrappingFees24h,
  twlData,
  wrappingFeesData,
  currency,
}) => {
  const [twlValue, setTwlValue] = useState<number | null>(null);
  const [twlDate, setTVLDate] = useState<Date | null>(null);
  const [wrappingFeesValue, setWrappingFeesValue] = useState<number | null>(
    null
  );
  const [wrappingFeesDate, setWrappingFeesDate] = useState<Date | null>(null);

  const numberSuffix = useMemo(
    () => (typeof currency === 'string' ? ` ${currency}` : ''),
    [currency]
  );

  return (
    <TableAndChartTabs tabs={[twlTab, wrappingFeesTab]}>
      {/* TWL */}
      <TabContent value={twlTab}>
        <ChartContainer
          currentValue={twl}
          value={twlValue}
          valueSuffix={numberSuffix}
          date={twlDate}
          className="bg-glass dark:bg-glass_dark lg:max-h-[278px]"
        >
          <AreaChart
            data={twlData}
            setDate={setTVLDate}
            setValue={setTwlValue}
            tooltipLabel="TWL"
            tooltipValueSuffix={numberSuffix}
          />
        </ChartContainer>
      </TabContent>

      {/* Wrapping Fees */}
      <TabContent value={wrappingFeesTab}>
        <ChartContainer
          currentValue={wrappingFees24h}
          value={wrappingFeesValue}
          valueSuffix={numberSuffix}
          date={wrappingFeesDate}
          className="bg-glass dark:bg-glass_dark lg:max-h-[278px]"
        >
          <BarChart
            data={wrappingFeesData}
            setDate={setWrappingFeesDate}
            setValue={setWrappingFeesValue}
            fillColor="purple"
            tooltipLabel="Wrapping Fees"
            tooltipValueSuffix={numberSuffix}
          />
        </ChartContainer>
      </TabContent>
    </TableAndChartTabs>
  );
};

export default PoolWrappingChartsCmp;
