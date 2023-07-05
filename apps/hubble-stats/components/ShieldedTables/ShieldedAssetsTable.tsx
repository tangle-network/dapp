import { useState, useMemo } from 'react';
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

export const ShieldedAssetsTable = () => {
  const [isDarkMode] = useDarkMode();
  const [data, setData] = useState<ShieldedAssetType[]>([]);

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

  return <TableTemplate data={data} columns={columns} pageSize={5} />;
};
