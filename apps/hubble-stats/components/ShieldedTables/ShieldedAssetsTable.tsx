import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { useDarkMode } from '@webb-tools/webb-ui-components';
import { ShieldedAssetDark, ShieldedAssetLight } from '@webb-tools/icons';

import { TableTemplate } from '.';
import {
  HeaderCell,
  IconsCell,
  NumberCell,
  PoolTypeCell,
  PoolType,
  ShieldedCell,
} from './cells';

export type ShieldedAssetType = {
  title: string;
  address: string;
  poolType: PoolType;
  composition: string[];
  deposits24h: number;
  tvl: number;
  chains: string[];
};

const columnHelper = createColumnHelper<ShieldedAssetType>();

const data: ShieldedAssetType[] = [
  {
    title: 'webbParachain',
    address: '0xc0ffee254729296a45a3885639AC7E10F9d54979',
    poolType: 'single',
    composition: ['avax', 'btc', 'dot'],
    deposits24h: 100,
    tvl: 1000,
    chains: ['polygon', 'goerli', 'avalanche', 'polkadot'],
  },
  {
    title: 'webbParachain',
    address: '0x1234...5678',
    poolType: 'multi',
    composition: ['link', 'matic', 'near', 'op', 'usdc'],
    deposits24h: 9999,
    tvl: 3_680_000,
    chains: ['polygon', 'scroll', 'optimism'],
  },
  {
    title: 'webbParachain',
    address: '0x1234...5678',
    poolType: 'single',
    composition: ['usdc', 'usdt'],
    deposits24h: 11000,
    tvl: 233_321,
    chains: ['cosmos', 'ethereum'],
  },
  {
    title: 'webbParachain',
    address: '0x1234...5678',
    poolType: 'multi',
    composition: ['weth', 'webbusdc'],
    deposits24h: 100,
    tvl: 3_680_000,
    chains: ['polygon-mumbai', 'tangle'],
  },
  {
    title: 'webbParachain',
    address: '0x1234...5678',
    poolType: 'single',
    composition: ['one', 'near'],
    deposits24h: 100,
    tvl: 233_321,
    chains: ['polygon', 'tangle'],
  },
  {
    title: 'webbParachain',
    address: '0x1234...5678',
    poolType: 'single',
    composition: ['moondev', 'matic', 'dot'],
    deposits24h: 100,
    tvl: 233_321,
    chains: ['polygon', 'tangle'],
  },
];

export const ShieldedAssetsTable = () => {
  const [isDarkMode] = useDarkMode();

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: () => (
          <HeaderCell title="Shielded Assets" className="justify-start" />
        ),
        cell: (row) => (
          <ShieldedCell
            title={row.row.original.title}
            address={row.row.original.address}
            icon={isDarkMode ? <ShieldedAssetDark /> : <ShieldedAssetLight />}
          />
        ),
      }),
      columnHelper.accessor('poolType', {
        header: () => <HeaderCell title="Pool Type" />,
        cell: (poolType) => <PoolTypeCell type={poolType.getValue()} />,
      }),
      columnHelper.accessor('composition', {
        header: () => <HeaderCell title="Composition" />,
        cell: (composition) => (
          <IconsCell type="tokens" items={composition.getValue()} />
        ),
      }),
      columnHelper.accessor('deposits24h', {
        header: () => <HeaderCell title="24H Deposits" />,
        cell: (deposits24h) => <NumberCell value={deposits24h.getValue()} />,
      }),
      columnHelper.accessor('tvl', {
        header: () => <HeaderCell title="TVL" tooltip="TVL" />,
        cell: (tvl) => <NumberCell value={tvl.getValue()} prefix="$" />,
      }),
      columnHelper.accessor('chains', {
        header: () => <HeaderCell title="Chains" className="justify-end" />,
        cell: (chains) => (
          <IconsCell
            type="chains"
            items={chains.getValue()}
            className="justify-end"
          />
        ),
      }),
    ],
    [isDarkMode]
  );

  return (
    <div>
      <TableTemplate data={data} columns={columns} pageSize={5} />
    </div>
  );
};
