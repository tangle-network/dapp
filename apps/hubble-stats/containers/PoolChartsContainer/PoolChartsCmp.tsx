'use client';

import { FC, useState } from 'react';
import {
  ChartContainer,
  TableAndChartTabs,
  TabContent,
} from '@webb-tools/webb-ui-components';

import { AreaChart, BarChart } from '../../components';
import { PoolChartsDataType } from '../../data';

const tvlTab = 'TVL';
const volumeTab = 'Volume';
const feesTab = 'Fees';

const PoolChartsCmp: FC<PoolChartsDataType> = ({
  currentTvl,
  currentVolume,
  currentFees,
  tvlData,
  volumeData,
  feesData,
}) => {
  const [tvlValue, setTvlValue] = useState<number | null>(null);
  const [tvlDate, setTVLDate] = useState<Date | null>(null);
  const [volumeValue, setVolumeValue] = useState<number | null>(null);
  const [volumeDate, setVolumeDate] = useState<Date | null>(null);
  const [feesValue, setFeesValue] = useState<number | null>(null);
  const [feesDate, setFeesDate] = useState<Date | null>(null);

  return (
    <TableAndChartTabs
      tabs={[tvlTab, volumeTab, feesTab]}
      headerClassName="w-full overflow-x-auto"
      triggerClassName="whitespace-nowrap"
      className="w-full"
    >
      {/* TVL */}
      <TabContent value={tvlTab}>
        <ChartContainer
          currentValue={currentTvl}
          value={tvlValue}
          date={tvlDate}
          className="bg-glass dark:bg-glass_dark lg:h-[278px]"
        >
          <AreaChart
            data={tvlData}
            setDate={setTVLDate}
            setValue={setTvlValue}
          />
        </ChartContainer>
      </TabContent>

      {/* Volume */}
      <TabContent value={volumeTab}>
        <ChartContainer
          currentValue={currentVolume}
          value={volumeValue}
          date={volumeDate}
          className="bg-glass dark:bg-glass_dark lg:h-[278px]"
        >
          <BarChart
            data={volumeData}
            setDate={setVolumeDate}
            setValue={setVolumeValue}
          />
        </ChartContainer>
      </TabContent>

      {/* Fees */}
      <TabContent value={feesTab}>
        <ChartContainer
          currentValue={currentFees}
          value={feesValue}
          date={feesDate}
          className="bg-glass dark:bg-glass_dark lg:h-[278px]"
        >
          <BarChart
            data={feesData}
            setDate={setFeesDate}
            setValue={setFeesValue}
            fillColor="purple"
          />
        </ChartContainer>
      </TabContent>
    </TableAndChartTabs>
  );
};

export default PoolChartsCmp;
