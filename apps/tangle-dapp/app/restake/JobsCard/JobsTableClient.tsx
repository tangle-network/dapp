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
import { FC } from 'react';

import { HeaderCell, StringCell } from '../../../components/tableCells';
import { TANGLE_TOKEN_UNIT } from '../../../constants';
import { JobType } from '../../../types';
import { getChipColorOfServiceType } from '../../../utils';

const columnHelper = createColumnHelper<JobType>();

const columns = [
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
        <StringCell value={`${earnings} ${TANGLE_TOKEN_UNIT}`} />
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
];

type JobsTableProps = {
  data: JobType[];
  pageSize: number;
};

const JobsTableClient: FC<JobsTableProps> = ({ data, pageSize }) => {
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
