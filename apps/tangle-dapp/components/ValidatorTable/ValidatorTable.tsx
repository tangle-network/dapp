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
  CopyWithTooltip,
  fuzzyFilter,
  shortenString,
  Table,
  Typography,
} from '@webb-tools/webb-ui-components';
import { type FC } from 'react';

import { Validator } from '../../types';
import { HeaderCell, StringCell } from '../tableCells';
import { ValidatorTableProps } from './types';

const columnHelper = createColumnHelper<Validator>();

const columns = [
  columnHelper.accessor('address', {
    header: () => <HeaderCell title="Identity" className="justify-start" />,
    cell: (props) => {
      const address = props.getValue();
      const identity = props.row.original.identity;

      return (
        <div className="flex space-x-1 items-center">
          <Avatar sourceVariant="address" value={address}>
            hello
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
  columnHelper.accessor('selfStaked', {
    header: () => <HeaderCell title="Self-staked" className="justify-start" />,
    cell: (props) => <StringCell value={props.getValue()} />,
  }),
  columnHelper.accessor('effectiveAmountStaked', {
    header: () => (
      <HeaderCell title="Effective amount staked" className="justify-start" />
    ),
    cell: (props) => <StringCell value={props.getValue()} />,
  }),
  columnHelper.accessor('delegations', {
    header: () => <HeaderCell title="Nominations" className="justify-center" />,
    cell: (props) => (
      <StringCell value={props.getValue()} className="text-center" />
    ),
  }),
];

const ValidatorTable: FC<ValidatorTableProps> = ({ data = [], pageSize }) => {
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
        tableClassName="block overflow-x-auto max-w-[-moz-fit-content] max-w-fit md:table md:max-w-none"
        thClassName="border-t-0 bg-mono-0"
        trClassName="cursor-pointer"
        paginationClassName="bg-mono-0 dark:bg-mono-180 pl-6"
        tableProps={table}
        isPaginated
        totalRecords={data.length}
      />
    </div>
  );
};

export default ValidatorTable;
