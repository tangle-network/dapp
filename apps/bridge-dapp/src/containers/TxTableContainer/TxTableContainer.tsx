import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ExternalLinkLine } from '@webb-tools/icons';
import { getExplorerURI } from '@webb-tools/api-provider-environment/transaction/utils';
import { chainsConfig } from '@webb-tools/dapp-config/chains';
import {
  ChainChip,
  Table,
  fuzzyFilter,
  Typography,
  getTimeDetailByEpoch,
} from '@webb-tools/webb-ui-components';
import { type FC, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import HiddenValue from '../../components/HiddenValue';
import type { TxTableContainerProps, TxTableItemType } from './types';

const columnHelper = createColumnHelper<TxTableItemType>();

const allColumns = [
  columnHelper.accessor('activity', {
    header: 'Activity',
    cell: (props) => (
      <Typography
        variant="body1"
        className="capitalize text-blue-70 dark:text-blue-50"
      >
        {props.getValue()}
      </Typography>
    ),
  }),
  columnHelper.accessor('tokenAmount', {
    header: 'Amount',
    cell: (props) => (
      <Typography variant="body1" className="whitespace-nowrap">
        <HiddenValue numberOfStars={3}>
          {props.getValue().toString()}
        </HiddenValue>{' '}
        {props.row.original.tokenSymbol}
      </Typography>
    ),
  }),
  columnHelper.accessor('sourceTypedChainId', {
    header: 'Source',
    cell: (props) => (
      <ChainChip
        chainName={chainsConfig[props.getValue()].name}
        chainType={chainsConfig[props.getValue()].group}
      />
    ),
  }),
  columnHelper.accessor('destinationTypedChainId', {
    header: 'Destination',
    cell: (props) => (
      <ChainChip
        chainName={chainsConfig[props.getValue()].name}
        chainType={chainsConfig[props.getValue()].group}
      />
    ),
  }),
  columnHelper.accessor('recipient', {
    header: 'Recipient',
    cell: (props) => (
      <div className="flex gap-1 items-center">
        <Typography variant="body1">{props.getValue() ?? '-'}</Typography>
        <ExternalLinkLine />
      </div>
    ),
  }),
  columnHelper.accessor('timestamp', {
    header: 'Time',
    cell: (props) => (
      <Typography variant="body1" className="whitespace-nowrap">
        {getTimeDetailByEpoch(props.getValue())}
      </Typography>
    ),
  }),
];

const TxTableContainer: FC<TxTableContainerProps> = ({
  data,
  pageSize,
  hideRecipientCol = false,
  className,
}) => {
  const columns = useMemo(
    () =>
      hideRecipientCol
        ? allColumns.filter((col) => {
            return col.header !== 'Recipient';
          })
        : allColumns,
    [hideRecipientCol]
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
    <div
      className={twMerge(
        'overflow-hidden border rounded-lg bg-mono-0 dark:bg-mono-180 border-mono-40 dark:border-mono-160',
        className
      )}
    >
      <Table
        tableClassName="block overflow-x-auto max-w-[-moz-fit-content] max-w-fit md:!table md:!max-w-none"
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

export default TxTableContainer;
