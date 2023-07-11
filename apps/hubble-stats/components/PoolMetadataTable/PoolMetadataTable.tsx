import { FC } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  Table as RTTable,
} from '@tanstack/react-table';
import { Table, fuzzyFilter, Typography } from '@webb-tools/webb-ui-components';
import { shortenHex } from '@webb-tools/webb-ui-components/utils';
import { ExternalLinkIcon } from '@radix-ui/react-icons';

import { PoolAttributeType, PoolMetadataTableProps } from './types';
import { HeaderCell } from '../table';

const columnHelper = createColumnHelper<PoolAttributeType>();

const columns: ColumnDef<PoolAttributeType, any>[] = [
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
    cell: (props) => (
      <Typography
        variant="body1"
        ta="center"
        className="text-mono-140 dark:text-mono-40"
      >
        {props.getValue() ? (
          props.row.original.isAddress ? (
            <div className="flex justify-center items-center gap-1">
              {shortenHex(props.getValue())}
              {props.row.original.externalLink && (
                <a
                  href={props.row.original.externalLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLinkIcon className="fill-mono-140 dark:fill-mono-40" />
                </a>
              )}
            </div>
          ) : (
            props.getValue()
          )
        ) : (
          '-'
        )}
      </Typography>
    ),
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
    <div className="overflow-hidden rounded-lg border border-mono-40 dark:border-mono-160">
      <Table
        thClassName="w-1/2 border-t-0 bg-mono-0 border-r last-of-type:border-r-0"
        tdClassName="border-r last-of-type:border-r-0"
        paginationClassName="bg-mono-0 dark:bg-mono-180 pl-6"
        tableProps={table as RTTable<unknown>}
        totalRecords={data.length}
      />
    </div>
  );
};

export default PoolMetadataTable;
