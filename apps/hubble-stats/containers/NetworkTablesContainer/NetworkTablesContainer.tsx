import { FC } from 'react';
import { TableAndChartTabs, Typography } from '@webb-tools/webb-ui-components';

import { NetworkPoolTable, NetworkTokenTable } from '../../components';
import { NetworkPoolType } from '../../components/NetworkPoolTable/types';
import { NetworkTokenType } from '../../components/NetworkTokenTable/types';

interface NetworkTablesContainerProps {
  typedChainIds?: number[];
  networkPoolData?: NetworkPoolType[];
  networkTokenData?: NetworkTokenType[];
}

const NetworkTablesContainer: FC<NetworkTablesContainerProps> = ({
  typedChainIds = [],
  networkPoolData = [],
  networkTokenData = [],
}) => {
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
        {typedChainIds.length > 0 && (
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

export default NetworkTablesContainer;
