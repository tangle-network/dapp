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
  IconsGroup,
  useDarkMode,
} from '@webb-tools/webb-ui-components';
import { ShieldedAssetDark, ShieldedAssetLight } from '@webb-tools/icons';

import { ShieldedAssetType, ShieldedAssetsTableProps } from './types';
import { HeaderCell, NumberCell, ShieldedCell } from '../table';
import { PoolTypeChip } from '..';

const columnHelper = createColumnHelper<ShieldedAssetType>();

const staticColumns: ColumnDef<ShieldedAssetType, any>[] = [
  columnHelper.accessor('poolType', {
    header: () => <HeaderCell title="Pool Type" />,
    cell: (props) => (
      <div className="text-center">
        <PoolTypeChip type={props.getValue()} />
      </div>
    ),
  }),
  columnHelper.accessor('composition', {
    header: () => <HeaderCell title="Composition" />,
    cell: (props) => (
      <IconsGroup
        icons={props.getValue()}
        type="token"
        className="justify-center"
      />
    ),
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
      <IconsGroup
        icons={props.getValue()}
        type="chain"
        className="justify-end"
      />
    ),
  }),
];

const ShieldedAssetsTable: FC<ShieldedAssetsTableProps> = ({
  data,
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
    <div className="overflow-hidden rounded-lg bg-mono-0 dark:bg-mono-180 border border-mono-40 dark:border-mono-160">
      <Table
        tableClassName="overflow-x-auto no-scrollbar"
        thClassName="border-t-0 bg-mono-0"
        paginationClassName="bg-mono-0 dark:bg-mono-180 pl-6"
        tableProps={table as RTTable<unknown>}
        isPaginated
        totalRecords={data.length}
      />
    </div>
  );
};

export default ShieldedAssetsTable;
