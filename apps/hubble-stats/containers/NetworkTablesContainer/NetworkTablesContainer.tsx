'use client';

import { FC } from 'react';
import { TableAndChartTabs, Typography } from '@webb-tools/webb-ui-components';

import { NetworkPoolTable, NetworkTokenTable } from '../../components';
import { NetworkPoolType } from '../../components/NetworkPoolTable/types';
import { NetworkTokenType } from '../../components/NetworkTokenTable/types';

interface NetworkTablesContainerProps {
  chains?: number[];
  networkPoolData?: NetworkPoolType[];
  networkTokenData?: NetworkTokenType[];
}

const NetworkTablesContainer: FC<NetworkTablesContainerProps> = ({
  chains = [],
  networkPoolData = [],
  networkTokenData = [],
}) => {
  return (
    <div className="space-y-12">
      <TableAndChartTabs
        tabs={['TVL', 'Volume', '24H Deposits', 'Relayer Fees']}
      >
        <NetworkPoolTable chains={chains} data={networkPoolData} />
      </TableAndChartTabs>

      <div className="space-y-1">
        <TableAndChartTabs tabs={['TWL', 'Wrapping Fees']}>
          <NetworkTokenTable chains={chains} data={networkTokenData} />
        </TableAndChartTabs>
        {chains.length > 0 && (
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
