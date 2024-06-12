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
import cx from 'classnames';
import Link from 'next/link';
import { FC, useMemo } from 'react';

import { EMPTY_VALUE_PLACEHOLDER } from '../../constants';
import useFormatNativeTokenAmount from '../../hooks/useFormatNativeTokenAmount';
import type { Service } from '../../types';
import { getChipColorOfServiceType } from '../../utils';
import { HeaderCell, StringCell } from '../tableCells';
import type { ServiceTableProps } from './types';

const columnHelper = createColumnHelper<Service>();

const EARNINGS_COLUMN_IDX = 5;

const staticColumns = [
  columnHelper.accessor('serviceType', {
    header: () => <HeaderCell title="Service Type" className="justify-start" />,
    cell: (props) => (
      <Chip
        color={getChipColorOfServiceType(props.getValue())}
        className="normal-case"
      >
        {props.getValue()}
      </Chip>
    ),
  }),
  columnHelper.accessor('id', {
    header: () => (
      <HeaderCell title="Initial Job Id" className="justify-start" />
    ),
    cell: (props) => <StringCell value={props.getValue().toString()} />,
  }),
  columnHelper.accessor('participants', {
    header: () => (
      <HeaderCell title="# of Participants" className="justify-start" />
    ),
    cell: (props) => <Chip color="dark-grey">{props.getValue().length}</Chip>,
  }),
  columnHelper.accessor('threshold', {
    header: () => <HeaderCell title="Threshold" className="justify-start" />,
    cell: (props) => {
      const thresholds = props.getValue();
      return typeof thresholds === 'number' ? (
        <Chip color="dark-grey">{thresholds}</Chip>
      ) : (
        EMPTY_VALUE_PLACEHOLDER
      );
    },
  }),
  // TODO: hide this column because we cannot get inactive jobs for now
  // columnHelper.accessor('jobsCount', {
  //   header: () => <HeaderCell title="# of Jobs" className="justify-start" />,
  //   cell: (props) => {
  //     const jobsCount = props.getValue();
  //     return jobsCount ? <StringCell value={`${jobsCount}`} /> : EMPTY_VALUE_PLACEHOLDER;
  //   },
  // }),
  columnHelper.accessor('expirationBlock', {
    header: () => (
      <HeaderCell title="Expiration Block" className="justify-center" />
    ),
    cell: (props) => (
      <StringCell
        value={`${props.getValue().toString()}`}
        className="text-center"
      />
    ),
  }),
  columnHelper.accessor('id', {
    id: 'details',
    header: () => null,
    cell: (props) => (
      <Link href={`/services/${props.row.original.id}`}>
        <Button variant="link" size="sm" className="mx-auto">
          DETAILS
        </Button>
      </Link>
    ),
  }),
];

const ServiceTable: FC<ServiceTableProps> = ({ data, pageSize }) => {
  const formatNativeTokenAmount = useFormatNativeTokenAmount();

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

          return earnings ? (
            <StringCell value={formatNativeTokenAmount(earnings)} />
          ) : (
            EMPTY_VALUE_PLACEHOLDER
          );
        },
      }),
      ...staticColumns.slice(EARNINGS_COLUMN_IDX),
    ],
    [formatNativeTokenAmount],
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
      className={cx(
        'bg-[linear-gradient(180deg,#FFF_0%,rgba(255,255,255,0.00)_100%)]',
        'dark:bg-[linear-gradient(180deg,#2B2F40_0%,rgba(43,47,64,0.00)_100%)]',
        'overflow-hidden rounded-2xl py-3 px-4',
        'border border-mono-0 dark:border-mono-160',
      )}
    >
      <Table
        thClassName="!bg-inherit !px-3 border-t-0 bg-mono-0 whitespace-nowrap"
        trClassName="!bg-inherit cursor-pointer"
        tdClassName="!bg-inherit !px-3 whitespace-nowrap !border-t-0"
        tableProps={table}
        isPaginated
        totalRecords={data.length}
      />
    </div>
  );
};

export default ServiceTable;
