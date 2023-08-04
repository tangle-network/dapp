import { TableAndChartTabs, Typography } from '@webb-tools/webb-ui-components';

import { NetworkPoolTable, NetworkTokenTable } from '../../components';
import { getNetworkTablesData } from '../../data';

export default async function NetworkTablesContainer({
  poolAddress,
}: {
  poolAddress: string;
}) {
  const { networkPoolData, networkTokenData, typedChainIds } =
    await getNetworkTablesData(poolAddress);

  return (
    <div className="space-y-12">
      <TableAndChartTabs
        tabs={['TVL', 'Volume', '24H Deposits', 'Relayer Fees']}
        headerClassName="w-full overflow-x-auto"
        triggerClassName="whitespace-nowrap"
      >
        <NetworkPoolTable
          typedChainIds={typedChainIds}
          data={networkPoolData}
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
}
