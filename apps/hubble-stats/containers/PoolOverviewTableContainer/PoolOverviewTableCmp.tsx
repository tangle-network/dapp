'use client';

import { FC, useState, useMemo } from 'react';
import { TableAndChartTabs, Typography } from '@webb-tools/webb-ui-components';

import { PoolOverviewTable } from '../../components';
import { PoolOverviewTableDataType } from '../../data/getPoolOverviewTableData';

const deposit24hTab = 'Deposits 24H' as const;
const withdrawal24hTab = 'Withdrawals 24H' as const;
const relayerEarningsTab = 'Relayer Earnings' as const;

const PoolOverviewTableCmp: FC<PoolOverviewTableDataType> = ({
  deposit24hData,
  withdrawal24hData,
  relayerEarningsData,
  typedChainIds,
}) => {
  const [activePoolTableTab, setActivePoolTableTab] = useState<
    typeof deposit24hTab | typeof withdrawal24hTab | typeof relayerEarningsTab
  >(deposit24hTab);

  const showingData = useMemo(() => {
    switch (activePoolTableTab) {
      case deposit24hTab:
        return deposit24hData;
      case withdrawal24hTab:
        return withdrawal24hData;
      case relayerEarningsTab:
        return relayerEarningsData;
    }
  }, [
    activePoolTableTab,
    relayerEarningsData,
    deposit24hData,
    withdrawal24hData,
  ]);

  return (
    <div className="space-y-1">
      <TableAndChartTabs
        tabs={[deposit24hTab, withdrawal24hTab, relayerEarningsTab]}
        headerClassName="w-full overflow-x-auto"
        triggerClassName="whitespace-nowrap"
        onValueChange={(val) =>
          setActivePoolTableTab(val as typeof activePoolTableTab)
        }
      >
        <PoolOverviewTable
          typedChainIds={typedChainIds}
          data={showingData}
          prefixUnit=""
        />
      </TableAndChartTabs>
      {typedChainIds.length > 0 &&
        activePoolTableTab === relayerEarningsTab && (
          <Typography
            variant="body2"
            className="font-bold !text-[12px] text-mono-120 dark:text-mono-80 text-right"
          >
            *HISTORICAL RELAYER EARNINGS
          </Typography>
        )}
    </div>
  );
};

export default PoolOverviewTableCmp;
