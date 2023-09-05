'use client';

import { FC, useState, useMemo } from 'react';
import { TableAndChartTabs, Typography } from '@webb-tools/webb-ui-components';

import { NetworkPoolTable, NetworkTokenTable } from '../../components';
import { NetworkTablesDataType } from '../../data/getNetworkTablesData';

const deposit24hTab = '24H Deposits' as const;
const withdrawal24hTab = '24H Withdrawals' as const;
const relayerEarningsTab = 'Relayer Earnings' as const;
const twlTab = 'TWL';
const wrappingFeesTab = 'Wrapping Fees';

const NetworkTablesCmp: FC<NetworkTablesDataType> = ({
  deposit24hData,
  withdrawal24hData,
  relayerEarningsData,
  twlData,
  wrappingFeesData,
  typedChainIds,
}) => {
  const [activePoolTableTab, setActivePoolTableTab] = useState<
    typeof deposit24hTab | typeof withdrawal24hTab | typeof relayerEarningsTab
  >(deposit24hTab);

  const [activeTokenTableTab, setActiveTokenTableTab] = useState<
    typeof twlTab | typeof wrappingFeesTab
  >(twlTab);

  const networkPoolTableData = useMemo(() => {
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

  const networkTokenTableData = useMemo(() => {
    switch (activeTokenTableTab) {
      case twlTab:
        return twlData;
      case wrappingFeesTab:
        return wrappingFeesData;
    }
  }, [activeTokenTableTab, twlData, wrappingFeesData]);

  return (
    <div className="space-y-12">
      <div className="space-y-1">
        <TableAndChartTabs
          tabs={[deposit24hTab, withdrawal24hTab, relayerEarningsTab]}
          headerClassName="w-full overflow-x-auto"
          triggerClassName="whitespace-nowrap"
          onValueChange={(val) =>
            setActivePoolTableTab(val as typeof activePoolTableTab)
          }
        >
          <NetworkPoolTable
            typedChainIds={typedChainIds}
            data={networkPoolTableData}
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

      <div className="space-y-1">
        <TableAndChartTabs
          tabs={[twlTab, wrappingFeesTab]}
          headerClassName="w-full overflow-x-auto"
          triggerClassName="whitespace-nowrap"
          onValueChange={(val) =>
            setActiveTokenTableTab(val as typeof activeTokenTableTab)
          }
        >
          <NetworkTokenTable
            typedChainIds={typedChainIds}
            data={networkTokenTableData}
            prefixUnit=""
          />
        </TableAndChartTabs>
        {typedChainIds.length > 0 && activeTokenTableTab === twlTab && (
          <Typography
            variant="body2"
            className="font-bold !text-[12px] text-mono-120 dark:text-mono-80 text-right"
          >
            *HISTORICAL TWL
          </Typography>
        )}
        {typedChainIds.length > 0 &&
          activeTokenTableTab === wrappingFeesTab && (
            <Typography
              variant="body2"
              className="font-bold !text-[12px] text-mono-120 dark:text-mono-80 text-right"
            >
              *HISTORICAL WRAPPING FEES
            </Typography>
          )}
      </div>
    </div>
  );
};

export default NetworkTablesCmp;
