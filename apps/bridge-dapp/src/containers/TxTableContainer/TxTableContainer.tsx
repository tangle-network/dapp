import {
  Row,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ColumnDef,
} from '@tanstack/react-table';
import { ArrowLeft, ExternalLinkLine } from '@webb-tools/icons';
import type { TransactionType } from '@webb-tools/abstract-api-provider';
import { chainsConfig } from '@webb-tools/dapp-config/chains';
import {
  ChainChip,
  Table,
  fuzzyFilter,
  Typography,
  getTimeDetailByEpoch,
  shortenHex,
  formatTokenAmount,
} from '@webb-tools/webb-ui-components';
import { type FC, useState, useCallback, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { useNavigate } from 'react-router';

import HiddenValue from '../../components/HiddenValue';
import type { TxTableContainerProps } from './types';
import { ACCOUNT_TRANSACTIONS_FULL_PATH } from '../../constants';

const staticColumns: ColumnDef<TransactionType>[] = [
  {
    header: 'Activity',
    accessorKey: 'activity',
    cell: (props) => (
      <Typography
        variant="body1"
        className="capitalize text-blue-70 dark:text-blue-50"
      >
        {props.row.original.activity}
      </Typography>
    ),
  },
  {
    header: 'Amount',
    accessorKey: 'amount',
    cell: (props) => (
      <Typography variant="body1" className="whitespace-nowrap">
        <HiddenValue numberOfStars={4}>
          {`${
            props.row.original.activity === 'deposit' ? '+' : '-'
          }${formatTokenAmount(props.row.original.amount.toString())}`}
        </HiddenValue>{' '}
        {props.row.original.wrapTokenSymbol ??
          props.row.original.unwrapTokenSymbol ??
          props.row.original.fungibleTokenSymbol}
      </Typography>
    ),
  },
  {
    header: 'Source',
    accessorKey: 'sourceTypedChainId',
    cell: (props) => (
      <ChainChip
        chainName={chainsConfig[props.row.original.sourceTypedChainId].name}
        chainType={chainsConfig[props.row.original.sourceTypedChainId].group}
      />
    ),
  },
  {
    header: 'Destination',
    accessorKey: 'destinationTypedChainId',
    cell: (props) => (
      <ChainChip
        chainName={
          chainsConfig[props.row.original.destinationTypedChainId].name
        }
        chainType={
          chainsConfig[props.row.original.destinationTypedChainId].group
        }
      />
    ),
  },
  {
    accessorKey: 'recipient',
    header: 'Recipient',
    cell: (props) => {
      const { recipientAddress, explorerUri } = props.row.original;
      return (
        <div className="flex gap-1 items-center">
          <Typography variant="body1">
            {recipientAddress ? shortenHex(recipientAddress) : '-'}
          </Typography>
          {explorerUri && (
            <a target="_blank" rel="noopener noreferrer" href={explorerUri}>
              <ExternalLinkLine />
            </a>
          )}
        </div>
      );
    },
  },
];

const TxTableContainer: FC<TxTableContainerProps> = ({
  data,
  pageSize,
  hideRecipientCol = false,
  className,
  allowSorting = true,
}) => {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'timestamp',
      desc: true,
    },
  ]);

  const columns = useMemo<ColumnDef<TransactionType>[]>(() => {
    const displayStaticColumns = hideRecipientCol
      ? staticColumns.filter((col) => col.header !== 'Recipient')
      : staticColumns;
    return [
      ...displayStaticColumns,
      {
        accessorKey: 'timestamp',
        header: (header) => {
          const sortingState = header.column.getIsSorted();
          return (
            <div
              className="!text-inherit flex items-center justify-end gap-1 cursor-pointer"
              onClick={() => {
                if (!allowSorting) return;
                setSorting([
                  {
                    id: header.column.id,
                    desc: sortingState === 'asc' ? true : false,
                  },
                ]);
              }}
            >
              <p className="!text-inherit">Time</p>
              {allowSorting && sortingState && (
                <ArrowLeft
                  className={twMerge(
                    '!fill-mono-140 dark:!fill-mono-60',
                    sortingState === 'asc' ? 'rotate-90' : '-rotate-90'
                  )}
                />
              )}
            </div>
          );
        },
        cell: (props) => (
          <Typography variant="body1" className="whitespace-nowrap" ta="right">
            {getTimeDetailByEpoch(props.row.original.timestamp)}
          </Typography>
        ),
      },
    ];
  }, [hideRecipientCol, allowSorting, setSorting]);

  const onRowClick = useCallback(
    (row: Row<TransactionType>) => {
      navigate(`${ACCOUNT_TRANSACTIONS_FULL_PATH}/${row.original.hash}`);
    },
    [navigate]
  );

  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: {
        pageSize,
      },
    },
    state: {
      sorting,
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: fuzzyFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSortingRemoval: false,
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
        onRowClick={onRowClick}
      />
    </div>
  );
};

export default TxTableContainer;
