import { FC, useMemo } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  Table as RTTable,
} from '@tanstack/react-table';
import {
  Table,
  fuzzyFilter,
  useDarkMode,
} from '@webb-tools/webb-ui-components';
import { ShieldedAssetDark, ShieldedAssetLight } from '@webb-tools/icons';

import { ShieldedAssetType, ShieldedAssetsTableProps } from './types';
import {
  HeaderCell,
  IconsCell,
  NumberCell,
  PoolTypeCell,
  ShieldedCell,
} from '../table';

const columnHelper = createColumnHelper<ShieldedAssetType>();

const staticColumns: ColumnDef<ShieldedAssetType, any>[] = [
  columnHelper.accessor('poolType', {
    header: () => <HeaderCell title="Pool Type" />,
    cell: (props) => <PoolTypeCell type={props.getValue()} />,
  }),
  columnHelper.accessor('composition', {
    header: () => <HeaderCell title="Composition" />,
    cell: (props) => <IconsCell type="tokens" items={props.getValue()} />,
  }),
  columnHelper.accessor('deposits24h', {
    header: () => <HeaderCell title="24H Deposits" />,
    cell: (props) => <NumberCell value={props.getValue()} />,
  }),
  columnHelper.accessor('tvl', {
    header: () => <HeaderCell title="TVL" tooltip="TVL" />,
    cell: (props) => <NumberCell value={props.getValue()} prefix="$" />,
  }),
  columnHelper.accessor('chains', {
    header: () => <HeaderCell title="Chains" className="justify-end" />,
    cell: (props) => (
      <IconsCell
        type="chains"
        items={props.getValue()}
        className="justify-end"
      />
    ),
  }),
];

export const ShieldedAssetsTable: FC<ShieldedAssetsTableProps> = ({
  data,
  globalSearchText,
  pageSize,
}) => {
  const [isDarkMode] = useDarkMode();

  const columns = useMemo<ColumnDef<ShieldedAssetType, any>[]>(
    () => [
      columnHelper.accessor('assetAddress', {
        header: () => (
          <HeaderCell title="Shielded Assets" className="justify-start" />
        ),
        cell: (props) => (
          <ShieldedCell
            title={props.row.original.assetSymbol}
            address={props.row.original.assetAddress}
            icon={isDarkMode ? <ShieldedAssetDark /> : <ShieldedAssetLight />}
          />
        ),
      }),
      ...staticColumns,
    ],
    [isDarkMode]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter: globalSearchText,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-lg bg-mono-0 dark:bg-mono-180">
      <Table
        thClassName="border-t-0 bg-mono-0 dark:bg-mono-160"
        tableProps={table as RTTable<unknown>}
        isPaginated
        totalRecords={data.length}
      />
    </div>
  );
};
