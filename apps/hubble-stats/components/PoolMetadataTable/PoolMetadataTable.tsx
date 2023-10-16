'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Table, Typography, fuzzyFilter } from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import { FC } from 'react';

import { HeaderCell } from '../tableCells';
import ExplorerUrlsDropdown from './ExplorerUrlsDropdown';
import WrappingFeesDropdown from './WrappingFeesDropdown';
import { PoolAttributeType, PoolMetadataTableProps } from './types';

const columnHelper = createColumnHelper<PoolAttributeType>();

const columns = [
  columnHelper.accessor('name', {
    header: () => <HeaderCell title="Attribute" />,
    cell: (props) => (
      <Typography
        variant="body1"
        ta="center"
        className="text-mono-140 dark:text-mono-40"
      >
        {props.getValue()}
      </Typography>
    ),
  }),
  columnHelper.accessor('detail', {
    header: () => <HeaderCell title="Details" />,
    cell: (props) => {
      const details = props.getValue();
      // if detail is a string
      if (typeof details === 'string')
        return (
          <Typography
            variant="body1"
            ta="center"
            className={cx(
              'text-mono-140 dark:text-mono-40',
              'flex justify-center items-center gap-1'
            )}
          >
            {details}
          </Typography>
        );
      // if detail is Address with Block explorer
      if (
        typeof details === 'object' &&
        'address' in details &&
        'urls' in details
      ) {
        return <ExplorerUrlsDropdown data={details} />;
      }
      // if details is Wrapping Fees by Chain
      if (typeof details === 'object') {
        return <WrappingFeesDropdown feesByChain={details} />;
      }
      return '-';
    },
  }),
];

const PoolMetadataTable: FC<PoolMetadataTableProps> = ({ data }) => {
  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden border rounded-lg border-mono-40 dark:border-mono-160">
      <Table
        thClassName="w-1/2 border-t-0 bg-mono-0 border-r last-of-type:border-r-0 first:pl-2 last:pr-2"
        tdClassName="h-[85px] border-r last-of-type:border-r-0 first:pl-2 last:pr-2"
        paginationClassName="bg-mono-0 dark:bg-mono-180 pl-6"
        tableProps={table}
        totalRecords={data.length}
      />
    </div>
  );
};

export default PoolMetadataTable;
