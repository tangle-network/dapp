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
  AvatarGroup,
  Chip,
  CopyWithTooltip,
  fuzzyFilter,
  shortenString,
  Table,
  Typography,
} from '@webb-tools/webb-ui-components';
import { type FC } from 'react';

import { Payout } from '../../types';
import { HeaderCell, StringCell } from '../tableCells';
import { PayoutTableProps } from './types';

const columnHelper = createColumnHelper<Payout>();

const columns = [
  columnHelper.accessor('era', {
    header: () => <HeaderCell title="Era" className="justify-start" />,
    cell: (props) => {
      return <StringCell value={props.getValue()} className="text-start" />;
    },
  }),
  columnHelper.accessor('validator', {
    header: () => <HeaderCell title="Validator" className="justify-start" />,
    cell: (props) => {
      const address = props.getValue().address;
      const identity = props.getValue().identity;

      return (
        <div
          className="flex space-x-1 items-center justify-start"
          key={`${props.row.original.era}-${address}`}
        >
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
  columnHelper.accessor('validatorTotalStake', {
    header: () => <HeaderCell title="Total Stake" className="justify-start" />,
    cell: (props) => (
      <StringCell value={props.getValue()} className="text-start" />
    ),
  }),
  columnHelper.accessor('nominators', {
    header: () => <HeaderCell title="Nominators" className="justify-start" />,
    cell: (props) => {
      const nominators = props.getValue();

      return (
        <AvatarGroup total={nominators.length}>
          {nominators.map((nominator) => (
            <Avatar
              key={nominator.address}
              sourceVariant="address"
              value={nominator.address}
              theme="substrate"
            />
          ))}
        </AvatarGroup>
      );
    },
  }),
  columnHelper.accessor('validatorTotalReward', {
    header: () => (
      <HeaderCell title="Total Rewards" className="justify-start" />
    ),
    cell: (props) => (
      <StringCell value={props.getValue()} className="text-start" />
    ),
  }),
  columnHelper.accessor('nominatorTotalReward', {
    header: () => <HeaderCell title="Your Rewards" className="justify-start" />,
    cell: (props) => (
      <StringCell value={props.getValue()} className="text-start" />
    ),
  }),
  columnHelper.accessor('validator', {
    header: () => (
      <HeaderCell title="Payout Status" className="justify-start" />
    ),
    cell: () => <Chip color="blue">Unclaimed</Chip>,
  }),
];

const PayoutTable: FC<PayoutTableProps> = ({ data = [], pageSize }) => {
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

export default PayoutTable;
