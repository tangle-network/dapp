import { createColumnHelper } from '@tanstack/react-table';
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
  token: number;
  deposits24h: number;
  tvl: number;
  chains: string[];
};

const columnHelper = createColumnHelper<ShieldedAssetType>();

const data: ShieldedAssetType[] = [
  {
    title: 'MASP-1',
    address: '0xc0ffee254729296a45a3885639AC7E10F9d54979',
    poolType: 'single',
    token: 4,
    deposits24h: 100,
    tvl: 1000,
    chains: ['polygon', 'goerli', 'avalanche', 'polkadot'],
  },
  {
    title: 'MASP-2',
    address: '0x1234...5678',
    poolType: 'multi',
    token: 3,
    deposits24h: 9999,
    tvl: 3_680_000,
    chains: ['polygon', 'scroll', 'optimism'],
  },
  {
    title: 'MASP-3',
    address: '0x1234...5678',
    poolType: 'single',
    token: 3,
    deposits24h: 11000,
    tvl: 233_321,
    chains: ['cosmos', 'ethereum'],
  },
  {
    title: 'MASP-4',
    address: '0x1234...5678',
    poolType: 'multi',
    token: 2,
    deposits24h: 100,
    tvl: 3_680_000,
    chains: ['polygon-mumbai', 'tangle'],
  },
  {
    title: 'MASP-5',
    address: '0x1234...5678',
    poolType: 'single',
    token: 2,
    deposits24h: 100,
    tvl: 233_321,
    chains: ['polygon', 'tangle'],
  },
  {
    title: 'MASP-6',
    address: '0x1234...5678',
    poolType: 'single',
    token: 5,
    deposits24h: 100,
    tvl: 233_321,
    chains: ['polygon', 'tangle'],
  },
];

export const ShieldedPoolsTable = () => {
  const columns = [
    columnHelper.accessor('title', {
      header: () => (
        <HeaderCell title="Shielded Pools" className="justify-start" />
      ),
      cell: (row) => (
        <ShieldedCell
          title={row.row.original.title}
          address={row.row.original.address}
        />
      ),
    }),
    columnHelper.accessor('poolType', {
      header: () => <HeaderCell title="Pool Type" />,
      cell: (poolType) => <PoolTypeCell type={poolType.getValue()} />,
    }),
    columnHelper.accessor('token', {
      header: () => <HeaderCell title="Token #" className="justify-end" />,
      cell: (token) => (
        <NumberCell value={token.getValue()} className="text-right" />
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
  ];

  return (
    <div>
      <TableTemplate data={data} columns={columns} pageSize={5} />
    </div>
  );
};
