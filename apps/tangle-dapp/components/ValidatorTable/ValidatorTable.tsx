'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  OnChangeFn,
  PaginationState,
  Row,
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
import { useRouter } from 'next/navigation';
import { FC, useCallback } from 'react';

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
          <Avatar sourceVariant="address" value={address} theme="substrate">
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

const ValidatorTable: FC<ValidatorTableProps> = ({
  data,
  pageSize,
  pageIndex,
  totalRecordCount,
  setPageIndex,
}) => {
  const router = useRouter();

  const onRowClick = useCallback(
    (row: Row<Validator>) => {
      router.push(`/nomination/${row.original.address}`);
    },
    [router]
  );

  const handlePaginationChange = useCallback<OnChangeFn<PaginationState>>(
    (updaterOrState) => {
      let newPaginationState;

      if (typeof updaterOrState === 'function') {
        // Handle updater function
        newPaginationState = updaterOrState({ pageIndex, pageSize });
        setPageIndex(newPaginationState.pageIndex);
      } else {
        // Handle direct state object
        newPaginationState = { ...updaterOrState, pageSize };
        setPageIndex(newPaginationState.pageIndex);
      }

      // Return the updated state
      return newPaginationState;
    },
    [pageIndex, pageSize, setPageIndex]
  );

  const table = useReactTable({
    data,
    columns,
    // initialState: { pagination },
    manualPagination: true,
    onPaginationChange: handlePaginationChange,
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    pageCount: Math.ceil(totalRecordCount / pageSize),
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
        onRowClick={onRowClick}
      />
    </div>
  );
};

export default ValidatorTable;
