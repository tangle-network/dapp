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
  chains = [
    1099511627781, 1099511628196, 1099511629063, 1099511670889, 1099511707777,
    1099512049389, 1099512162129, 1099522782887,
  ],
  networkPoolData = [
    {
      poolName: 'webbParachain',
      poolSymbol: 'webbPRC',
      poolAggregate: 6_400_000,
      prefixUnit: '$',
      chainsData: {
        1099511627781: 1_000_000,
        1099511628196: 1_000_000,
        1099511629063: 1_000_000,
        1099511670889: 1_000_000,
        1099511707777: 1_000_000,
        1099512049389: 1_000_000,
        1099512162129: 1_000_000,
        1099522782887: 1_000_000,
      },
    },
  ],
  networkTokenData = [
    {
      symbol: 'webbPRC',
      aggregate: 6_400_000,
      prefixUnit: '$',
      chainsData: {
        1099511627781: 1_000_000,
        1099511628196: 1_000_000,
        1099511629063: 1_000_000,
        1099511670889: 1_000_000,
        1099511707777: 1_000_000,
        1099512049389: 1_000_000,
        1099512162129: 1_000_000,
        1099522782887: 1_000_000,
      },
      tokens: [
        {
          symbol: 'eth',
          aggregate: 6_400_000,
          compositionPercentage: 55,
          prefixUnit: '$',
          chainsData: {
            1099511627781: 1_000_000,
            1099511628196: 1_000_000,
            1099511629063: 1_000_000,
            1099511670889: 1_000_000,
            // 1099511707777: 1_000_000,
            1099512049389: 1_000_000,
            1099512162129: 1_000_000,
            1099522782887: 1_000_000,
          },
        },
        {
          symbol: 'usdt',
          aggregate: 6_400_000,
          compositionPercentage: 45,
          prefixUnit: '$',
          chainsData: {
            1099511627781: 1_000_000,
            1099511628196: 1_000_000,
            1099511629063: 1_000_000,
            1099511670889: 1_000_000,
            // 1099511707777: 1_000_000,
            // 1099512049389: 1_000_000,
            1099512162129: 1_000_000,
            1099522782887: 1_000_000,
          },
        },
      ],
    },
  ],
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
