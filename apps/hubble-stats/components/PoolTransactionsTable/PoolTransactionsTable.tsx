'use client';

import {
  Row,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { getExplorerURI } from '@webb-tools/api-provider-environment/transaction/utils';
import { chainsConfig } from '@webb-tools/dapp-config/chains';
import { ChainChip, Table, fuzzyFilter } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import {
  ActivityCell,
  DestinationCell,
  HeaderCell,
  NumberCell,
  TimeCell,
} from '../tableCells';
import { PoolTransactionType, PoolTransactionsTableProps } from './types';

const columnHelper = createColumnHelper<PoolTransactionType>();

const columns = [
  columnHelper.accessor('activity', {
    header: () => <HeaderCell title="Pool Type" className="justify-start" />,
    cell: (props) => <ActivityCell activity={props.row.original.activity} />,
  }),
  columnHelper.accessor('tokenAmount', {
    header: () => <HeaderCell title="Token Amount" className="justify-start" />,
    cell: (props) => (
      <NumberCell
        value={props.row.original.tokenAmount}
        suffix={props.row.original.tokenSymbol}
        className="justify-start"
        isProtected={props.row.original.activity === 'transfer'}
      />
    ),
  }),
  columnHelper.accessor('sourceTypedChainId', {
    header: () => <HeaderCell title="Source" className="justify-start" />,
    cell: (props) => (
      <ChainChip
        chainName={chainsConfig[props.getValue()].name}
        chainType={chainsConfig[props.getValue()].group}
        // shorten the title to last word of the chain name
        title={chainsConfig[props.getValue()].name.split(' ').pop()}
      />
    ),
  }),
  columnHelper.accessor('destinationTypedChainId', {
    header: () => <HeaderCell title="Destination" className="justify-start" />,
    cell: (props) => <DestinationCell />,
  }),
  columnHelper.accessor('time', {
    header: () => <HeaderCell title="Time" className="justify-end" />,
    cell: (props) => (
      <TimeCell time={props.row.original.time} className="text-right" />
    ),
  }),
];

const PoolTransactionsTable: FC<PoolTransactionsTableProps> = ({
  data,
  pageSize,
}) => {
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

  const onRowClick = (row: Row<PoolTransactionType>) => {
    const sourceTypedChainId = row.original.sourceTypedChainId;
    const txHash = row.original.txHash;

    const blockExplorerUrl =
      chainsConfig[sourceTypedChainId]?.blockExplorers?.default?.url;

    if (blockExplorerUrl !== undefined) {
      const txExplorerURI = getExplorerURI(
        blockExplorerUrl,
        txHash,
        'tx',
        'web3'
      );
      window.open(txExplorerURI, '_blank');
    }
  };

  return (
    <div className="overflow-hidden border rounded-lg border-mono-40 dark:border-mono-160">
      <Table
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

export default PoolTransactionsTable;
