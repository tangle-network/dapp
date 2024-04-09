'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Avatar,
  Chip,
  CopyWithTooltip,
  fuzzyFilter,
  shortenString,
  Table,
  Typography,
} from '@webb-tools/webb-ui-components';
import { type FC } from 'react';

import { Delegator } from '../../types';
import { HeaderCell, StringCell } from '../tableCells';
import { DelegatorTableProps } from './types';

const columnHelper = createColumnHelper<Delegator>();

const columns = [
  columnHelper.accessor('address', {
    header: () => <HeaderCell title="Validator" className="justify-start" />,
    cell: (props) => {
      const address = props.getValue();
      const identity = props.row.original.identity;

      return (
        <div className="flex items-center space-x-1">
          <Avatar sourceVariant="address" value={address} theme="substrate">
            {address}
          </Avatar>

          <Typography variant="body1" fw="normal" className="truncate">
            {identity === address ? shortenString(address, 6) : identity}
          </Typography>

          <CopyWithTooltip
            textToCopy={address}
            isButton={false}
            className="cursor-pointer"
          />
        </div>
      );
    },
  }),
  columnHelper.accessor('isActive', {
    header: () => <HeaderCell title="Status" className="justify-start" />,
    cell: (props) => {
      const isActive = props.getValue();
      return (
        <Chip color={isActive ? 'green' : 'yellow'}>
          {isActive ? 'Active' : 'Waiting'}
        </Chip>
      );
    },
  }),
  columnHelper.accessor('selfStaked', {
    header: () => <HeaderCell title="Self-staked" className="justify-center" />,
    cell: (props) => (
      <StringCell value={props.getValue()} className="text-center" />
    ),
  }),
  columnHelper.accessor('effectiveAmountStaked', {
    header: () => (
      <HeaderCell title="Effective amount staked" className="justify-center" />
    ),
    cell: (props) => (
      <StringCell value={props.getValue()} className="text-center" />
    ),
  }),
  columnHelper.accessor('delegations', {
    header: () => <HeaderCell title="Nominations" className="justify-center" />,
    cell: (props) => (
      <StringCell value={props.getValue()} className="text-center" />
    ),
  }),
  columnHelper.accessor('commission', {
    header: () => <HeaderCell title="Commission" className="justify-center" />,
    cell: (props) => (
      <StringCell
        value={Number(props.getValue()).toFixed(2) + '%'}
        className="text-center"
      />
    ),
  }),
];

const DelegatorTable: FC<DelegatorTableProps> = ({ data = [], pageSize }) => {
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
    <div className="overflow-hidden border rounded-lg bg-mono-0 dark:bg-mono-180 border-mono-40 dark:border-mono-160">
      <Table
        thClassName="border-t-0 bg-mono-0"
        paginationClassName="bg-mono-0 dark:bg-mono-180 pl-6"
        tableProps={table}
        isPaginated
        totalRecords={data.length}
      />
    </div>
  );
};

export default DelegatorTable;
