'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import getExplorerURI from '@webb-tools/api-provider-environment/transaction/utils/getExplorerURI';
import { chainsConfig } from '@webb-tools/dapp-config/chains';
import { PresetTypedChainId } from '@webb-tools/dapp-types';
import {
  ExternalLinkIcon,
  fuzzyFilter,
  shortenHex,
  Table,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { SkeletonRow } from '../../../components/skeleton';
import { HeaderCell, StringCell } from '../../../components/tableCells';
import useNetworkStore from '../../../context/useNetworkStore';
import { useServiceJobs } from '../../../data/serviceDetails';
import { ExplorerType, ServiceJob } from '../../../types';

interface JobsListTableProps {
  serviceId: string;
  className?: string;
}

const PAGE_SIZE = 10;
const TANGLE_BLOCK_EXPLORER =
  chainsConfig[PresetTypedChainId.TangleTestnetNative].blockExplorers?.default
    .url;

const columnHelper = createColumnHelper<ServiceJob>();

const idColumn = columnHelper.accessor('id', {
  header: () => <HeaderCell title="Job ID" className="justify-start" />,
  cell: (props) => <StringCell value={props.getValue()} />,
});

const timestampColumn = columnHelper.accessor('timestamp', {
  header: () => <HeaderCell title="Timestamp" className="justify-start" />,
  cell: (props) => (
    <StringCell value={formatDate(new Date(props.getValue()))} />
  ),
});

const JobsListTable: FC<JobsListTableProps> = ({ serviceId, className }) => {
  const { network } = useNetworkStore();
  const { data, isLoading, error } = useServiceJobs(serviceId);

  const columns = useMemo(
    () => [
      idColumn,
      columnHelper.accessor('txHash', {
        header: () => <HeaderCell title="Tx Hash" className="justify-start" />,
        cell: (props) => {
          const txHash = props.getValue();

          const txExplorerURI = TANGLE_BLOCK_EXPLORER
            ? getExplorerURI(
                network.polkadotExplorerUrl,
                txHash,
                'tx',
                ExplorerType.Substrate
              ).toString()
            : null;
          return (
            <div className="flex gap-1 items-center">
              <StringCell value={shortenHex(txHash, 5)} />
              {txExplorerURI && <ExternalLinkIcon href={txExplorerURI} />}
            </div>
          );
        },
      }),
      timestampColumn,
    ],
    [network.polkadotExplorerUrl]
  );

  const table = useReactTable({
    data: data ?? [],
    columns,
    initialState: {
      pagination: {
        pageSize: PAGE_SIZE,
      },
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div
      className={twMerge(
        'h-full bg-[linear-gradient(180deg,#FFF_0%,rgba(255,255,255,0.00)_100%)]',
        'dark:bg-[linear-gradient(180deg,#2B2F40_0%,rgba(43,47,64,0.00)_100%)]',
        'overflow-hidden rounded-2xl p-5',
        'border border-mono-0 dark:border-mono-160',
        className
      )}
    >
      {/* Successfully get data */}
      {data && !isLoading && !error && (
        <Table
          thClassName="!bg-inherit px-3 first:pl-3 border-t-0 bg-mono-0 whitespace-nowrap"
          trClassName="!bg-inherit cursor-pointer"
          tdClassName="!bg-inherit px-3 first:pl-3 whitespace-nowrap !border-t-0"
          tableProps={table}
          totalRecords={data.length}
          className="h-full flex flex-col"
          tableWrapperClassName="h-full overflow-y-auto"
          isPaginated
        />
      )}

      {/* Loading */}
      {isLoading && <SkeletonRow />}

      {/* Error */}
      {!isLoading && !data && error && (
        <Typography variant="body1">Error</Typography>
      )}
    </div>
  );
};

export default JobsListTable;

/** @internal */
function formatDate(date: Date): string {
  // Pad single digit number with trailing zero
  const addZero = (num: number): string => (num < 10 ? '0' : '') + num;

  const hours = addZero(date.getHours());
  const minutes = addZero(date.getMinutes());
  const seconds = addZero(date.getSeconds());
  const year = date.getFullYear();
  const month = addZero(date.getMonth() + 1); // Months are 0 indexed
  const day = addZero(date.getDate());

  return `${hours}:${minutes}:${seconds} ${year}-${month}-${day}`;
}
