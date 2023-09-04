'use client';

import { FC, useState, useMemo } from 'react';
import { TableAndChartTabs, Typography } from '@webb-tools/webb-ui-components';

import { NetworkPoolTable, NetworkTokenTable } from '../../components';
import { NetworkTablesDataType } from '../../data/getNetworkTablesData';

const tvlTab = 'TVL' as const;
const relayerEarningsTab = 'Relayer Earnings' as const;
const twlTab = 'TWL';
const wrappingFeesTab = 'Wrapping Fees';

const NetworkTablesCmp: FC<NetworkTablesDataType> = ({
  tvlData,
  relayerEarningsData,
  networkTokenData,
  typedChainIds,
}) => {
  console.log('tvlData :', tvlData);

  const [activePoolTableTab, setActivePoolTableTab] = useState<
    typeof tvlTab | typeof relayerEarningsTab
  >(tvlTab);

  const networkPoolTableData = useMemo(() => {
    return activePoolTableTab === tvlTab ? tvlData : relayerEarningsData;
  }, [tvlData, relayerEarningsData, activePoolTableTab]);

  return (
    <div className="space-y-12">
      <TableAndChartTabs
        tabs={['TVL', 'Relayer Earnings']}
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

      <div className="space-y-1">
        <TableAndChartTabs
          tabs={['TWL', 'Wrapping Fees']}
          headerClassName="w-full overflow-x-auto"
          triggerClassName="whitespace-nowrap"
        >
          <NetworkTokenTable
            typedChainIds={typedChainIds}
            data={networkTokenData}
            prefixUnit=""
          />
        </TableAndChartTabs>
        {typedChainIds !== undefined && typedChainIds.length > 0 && (
          <Typography
            variant="body2"
            className="font-bold !text-[12px] text-mono-120 dark:text-mono-80 text-right"
          >
            *TOKEN NOT SUPPORTED ON NETWORK
          </Typography>
        )}
      </div>
    </div>
  );
};

export default NetworkTablesCmp;
