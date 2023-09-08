'use client';

import { FC, useState, useMemo } from 'react';
import { TableAndChartTabs, Typography } from '@webb-tools/webb-ui-components';

import { PoolWrappingTable } from '../../components';
import { PoolWrappingTableDataType } from '../../data/getPoolWrappingTableData';

const twlTab = 'TWL';
const wrappingFeesTab = 'Wrapping Fees';

const PoolWrappingTableCmp: FC<PoolWrappingTableDataType> = ({
  twlData,
  wrappingFeesData,
  typedChainIds,
}) => {
  const [activeTokenTableTab, setActiveTokenTableTab] = useState<
    typeof twlTab | typeof wrappingFeesTab
  >(twlTab);

  const showingData = useMemo(() => {
    switch (activeTokenTableTab) {
      case twlTab:
        return twlData;
      case wrappingFeesTab:
        return wrappingFeesData;
    }
  }, [activeTokenTableTab, twlData, wrappingFeesData]);

  return (
    <div className="space-y-1">
      <TableAndChartTabs
        tabs={[twlTab, wrappingFeesTab]}
        headerClassName="w-full overflow-x-auto"
        triggerClassName="whitespace-nowrap"
        onValueChange={(val) =>
          setActiveTokenTableTab(val as typeof activeTokenTableTab)
        }
      >
        <PoolWrappingTable
          typedChainIds={typedChainIds}
          data={showingData}
          prefixUnit=""
        />
      </TableAndChartTabs>
      {typedChainIds.length > 0 && activeTokenTableTab === twlTab && (
        <Typography
          variant="body2"
          className="font-bold !text-[12px] text-mono-120 dark:text-mono-80 text-right"
        >
          *TOTAL WRAPPED LOCKED
        </Typography>
      )}
      {typedChainIds.length > 0 && activeTokenTableTab === wrappingFeesTab && (
        <Typography
          variant="body2"
          className="font-bold !text-[12px] text-mono-120 dark:text-mono-80 text-right"
        >
          *HISTORICAL WRAPPING FEES
        </Typography>
      )}
    </div>
  );
};

export default PoolWrappingTableCmp;
