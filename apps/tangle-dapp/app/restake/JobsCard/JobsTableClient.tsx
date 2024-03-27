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
  Button,
  Chip,
  fuzzyFilter,
  Table,
} from '@webb-tools/webb-ui-components';
import { FC, useMemo } from 'react';

import { HeaderCell, StringCell } from '../../../components/tableCells';
import useNetworkStore from '../../../context/useNetworkStore';
import { JobType } from '../../../types';
import { getChipColorOfServiceType } from '../../../utils';

const columnHelper = createColumnHelper<JobType>();
const EARNINGS_COLUMN_IDX = 3;

const staticColumns = [
  columnHelper.accessor('id', {
    header: () => <HeaderCell title="ID" className="justify-start" />,
    cell: (props) => {
      const val = props.getValue();

      if (typeof val === 'number') {
        return <Chip color="dark-grey">{props.getValue()}</Chip>;
      }

      return '---';
    },
  }),
  columnHelper.accessor('serviceType', {
    header: () => <HeaderCell title="Service Type" className="justify-start" />,
    cell: (props) => (
      <Chip color={getChipColorOfServiceType(props.getValue())}>
        {props.getValue()}
      </Chip>
    ),
  }),
  columnHelper.accessor('thresholds', {
    header: () => <HeaderCell title="Thresholds" className="justify-start" />,
    cell: (props) => {
      const thresholds = props.getValue();
      return typeof thresholds === 'number' ? (
        <Chip color="dark-grey">{thresholds}</Chip>
      ) : (
        '---'
      );
    },
  }),
  columnHelper.accessor('expiration', {
    header: () => <HeaderCell title="Expiration" className="justify-center" />,
    cell: (props) => (
      <StringCell value={`${props.getValue()}`} className="text-center" />
    ),
  }),
  columnHelper.accessor('id', {
    id: 'details',
    header: () => null,
    cell: () => (
      // TODO: Handle the click event for the button
      <Button variant="link" size="sm" className="mx-auto">
        DETAILS
      </Button>
    ),
  }),
] as const;

type JobsTableProps = {
  data: JobType[];
  pageSize: number;
};

const JobsTableClient: FC<JobsTableProps> = ({ data, pageSize }) => {
  const { nativeTokenSymbol } = useNetworkStore();

  const columns = useMemo(
    () => [
      ...staticColumns.slice(0, EARNINGS_COLUMN_IDX),
      columnHelper.accessor('earnings', {
        header: () => (
          <HeaderCell
            title="Earnings"
            className="justify-start"
            tooltip="The rewards received by each participant in the service"
          />
        ),
        cell: (props) => {
          const earnings = props.getValue();
          return typeof earnings === 'number' ? (
            <StringCell value={`${earnings} ${nativeTokenSymbol}`} />
          ) : (
            '---'
          );
        },
      }),
      ...staticColumns.slice(EARNINGS_COLUMN_IDX),
    ],
    [nativeTokenSymbol]
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
    <Table
      thClassName="!bg-inherit first:!pl-0 !px-3 !py-2 border-t-0 bg-mono-0 whitespace-nowrap"
      trClassName="!bg-inherit cursor-pointer"
      tdClassName="!bg-inherit first:!pl-0 !px-3 !py-2 whitespace-nowrap !border-t-0"
      paginationClassName="pb-0"
      tableProps={table}
      isPaginated
      totalRecords={data.length}
    />
  );
};

export default JobsTableClient;
