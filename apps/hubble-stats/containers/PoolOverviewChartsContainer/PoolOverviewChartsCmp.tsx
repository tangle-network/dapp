'use client';

import { FC, useState, useMemo } from 'react';
import {
  ChartContainer,
  TableAndChartTabs,
  TabContent,
} from '@webb-tools/webb-ui-components';

import { AreaChart, BarChart, VolumeChart } from '../../components';
import { PoolChartsDataType } from '../../data';

const tvlTab = 'TVL';
const volumeTab = 'Volume';
const relayerEarningTab = 'Relayer Earnings';

const PoolOverviewChartsCmp: FC<PoolChartsDataType> = ({
  tvl,
  deposit24h,
  relayerEarnings24h,
  tvlData,
  volumeData,
  relayerEarningsData,
  currency,
}) => {
  const [tvlValue, setTvlValue] = useState<number | null>(null);
  const [tvlDate, setTVLDate] = useState<Date | null>(null);
  const [volumeValue, setVolumeValue] = useState<number | null>(null);
  const [volumeDate, setVolumeDate] = useState<Date | null>(null);
  const [relayerEarningsValue, setRelayerEarningsValue] = useState<
    number | null
  >(null);
  const [relayerEarningsDate, setRelayerEarningsDate] = useState<Date | null>(
    null
  );

  const numberSuffix = useMemo(
    () => (typeof currency === 'string' ? ` ${currency}` : ''),
    [currency]
  );

  return (
    <TableAndChartTabs tabs={[tvlTab, volumeTab, relayerEarningTab]}>
      {/* TVL */}
      <TabContent value={tvlTab}>
        <ChartContainer
          currentValue={tvl}
          value={tvlValue}
          valueSuffix={numberSuffix}
          date={tvlDate}
          className="bg-glass dark:bg-glass_dark lg:max-h-[278px]"
        >
          <AreaChart
            data={tvlData}
            setDate={setTVLDate}
            setValue={setTvlValue}
            tooltipLabel="TVL"
            tooltipValueSuffix={numberSuffix}
          />
        </ChartContainer>
      </TabContent>

      {/* Volume */}
      <TabContent value={volumeTab}>
        <ChartContainer
          currentValue={deposit24h}
          value={volumeValue}
          valueSuffix={numberSuffix}
          date={volumeDate}
          className="bg-glass dark:bg-glass_dark lg:max-h-[278px]"
        >
          <VolumeChart
            data={volumeData}
            setDate={setVolumeDate}
            setValue={setVolumeValue}
            tooltipValueSuffix={numberSuffix}
          />
        </ChartContainer>
      </TabContent>

      {/* Relayer Earnings */}
      <TabContent value={relayerEarningTab}>
        <ChartContainer
          currentValue={relayerEarnings24h}
          value={relayerEarningsValue}
          valueSuffix={numberSuffix}
          date={relayerEarningsDate}
          className="bg-glass dark:bg-glass_dark lg:max-h-[278px]"
        >
          <BarChart
            data={relayerEarningsData}
            setDate={setRelayerEarningsDate}
            setValue={setRelayerEarningsValue}
            fillColor="purple"
            tooltipLabel="Relayer Earnings"
            tooltipValueSuffix={numberSuffix}
          />
        </ChartContainer>
      </TabContent>
    </TableAndChartTabs>
  );
};

export default PoolOverviewChartsCmp;
