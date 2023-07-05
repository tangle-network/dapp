import { useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';

import { TableTemplate } from '..';
import {
  HeaderCell,
  IconsCell,
  NumberCell,
  PoolTypeCell,
  PoolType,
  ShieldedCell,
} from '../table-cells';

export type ShieldedPoolType = {
  title: string;
  address: string;
  poolType: PoolType;
  token: number;
  deposits24h: number;
  tvl: number;
  chains: string[];
};

const columnHelper = createColumnHelper<ShieldedPoolType>();

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

export const ShieldedPoolsTable = () => {
  const [data, setData] = useState<ShieldedPoolType[]>([]);

  return (
    <TableTemplate data={data} columns={columns} pageSize={5} hasPagination />
  );
};
