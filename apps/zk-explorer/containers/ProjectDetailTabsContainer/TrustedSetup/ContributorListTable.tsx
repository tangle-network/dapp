'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  Typography,
  fuzzyFilter,
  shortenString,
} from '@webb-tools/webb-ui-components';
import type { FC } from 'react';

import SmallChip from '../../../components/SmallChip';
import type { ContributionListItem } from '../../../server';

const PAGE_SIZE = 5;
const columnHelper = createColumnHelper<ContributionListItem>();

const columns = [
  columnHelper.accessor('doc', {
    header: 'Doc',
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor('contributionDate', {
    header: 'Contribution Date',
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor('hashes', {
    header: 'Hashes',
    cell: (props) => shortenString(props.getValue(), 10),
  }),
];

const ContributionListTable: FC<{ data: ContributionListItem[] }> = ({
  data,
}) => {
  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    initialState: {
      pagination: {
        pageSize: PAGE_SIZE,
      },
    },
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1">
        <Typography variant="body1" fw="bold">
          Contribution List
        </Typography>
        <SmallChip className="py-1 px-2 rounded-2xl">{data.length}</SmallChip>
      </div>

      <div className="overflow-x-auto rounded-lg border border-mono-40 dark:border-mono-160">
        <Table
          tableClassName="lg:table-fixed block overflow-x-auto max-w-[-moz-fit-content] md:table md:max-w-none"
          thClassName="last:text-right dark:bg-mono-180 border-t-0 text-mono-140 dark:text-mono-60"
          tdClassName="last:text-right dark:!bg-mono-180 text-mono-140 dark:text-mono-60"
          paginationClassName="dark:bg-mono-180 text-mono-140 dark:text-mono-60"
          tableProps={table}
          totalRecords={data.length}
          isPaginated
        />
      </div>
    </div>
  );
};

export default ContributionListTable;
