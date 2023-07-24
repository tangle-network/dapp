'use client';

import { FC } from 'react';
import { TableAndChartTabs, Typography } from '@webb-tools/webb-ui-components';

import { NetworkPoolTable } from '../../components';
import { NetworkPoolType } from '../../components/NetworkPoolTable/types';

interface NetworkTablesContainerProps {
  chains?: number[];
  networkPoolData?: NetworkPoolType[];
}

const NetworkTablesContainer: FC<NetworkTablesContainerProps> = ({
  chains = [],
  networkPoolData = [],
}) => {
  return (
    <div className="space-y-1">
      <TableAndChartTabs
        tabs={['TVL', 'Volume', '24H Deposits', 'Relayer Fees']}
      >
        <NetworkPoolTable chains={chains} data={networkPoolData} />
      </TableAndChartTabs>
      {/* {chains.length > 0 && (
        <Typography
          variant="body2"
          className="font-bold !text-[12px] !text-mono-120 text-right"
        >
          *TOKEN NOT SUPPORTED ON NETWORK
        </Typography>
      )} */}
    </div>
  );
};

export default NetworkTablesContainer;
