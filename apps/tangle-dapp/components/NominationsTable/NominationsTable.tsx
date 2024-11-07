'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  Avatar,
  Chip,
  CopyWithTooltip,
  fuzzyFilter,
  shortenString,
  Table,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useState } from 'react';

import { Nominee } from '../../types';
import calculateCommission from '../../utils/calculateCommission';
import {
  getSortAddressOrIdentityFnc,
  sortBnValueForNomineeOrValidator,
} from '../../utils/table';
import { HeaderCell, StringCell } from '../tableCells';
import PercentageCell from '../tableCells/PercentageCell';
import TokenAmountCell from '../tableCells/TokenAmountCell';

const columnHelper = createColumnHelper<Nominee>();

const columns = [
  columnHelper.accessor('address', {
    header: () => <HeaderCell title="Validator" className="justify-start" />,
    cell: (props) => {
      const address = props.getValue();
      const identityName = props.row.original.identityName;

      return (
        <div className="flex items-center space-x-1">
          <Avatar sourceVariant="address" value={address} theme="substrate">
            {address}
          </Avatar>

          <Typography variant="body1" fw="normal" className="truncate">
            {identityName === address
              ? shortenString(address, 6)
              : identityName}
          </Typography>

          <CopyWithTooltip textToCopy={address} isButton={false} />
        </div>
      );
    },
    sortingFn: getSortAddressOrIdentityFnc<Nominee>(),
  }),
  columnHelper.accessor('isActive', {
    header: () => <HeaderCell title="Status" className="justify-start" />,
    cell: (props) => {
      const isActive = props.getValue();
      return (
        <Chip color={isActive ? 'green' : 'yellow'}>
          {isActive ? 'Active' : 'Waiting'}
        </Chip>
      );
    },
    sortingFn: (rowA, _) => {
      const isActiveA = rowA.original.isActive;
      return isActiveA ? 1 : -1;
    },
  }),
  columnHelper.accessor('selfStakeAmount', {
    header: () => <HeaderCell title="Self-staked" className="justify-center" />,
    cell: (props) => <TokenAmountCell amount={props.getValue()} />,
    sortingFn: sortBnValueForNomineeOrValidator,
  }),
  columnHelper.accessor('totalStakeAmount', {
    header: () => (
      <HeaderCell title="Effective amount staked" className="justify-center" />
    ),
    cell: (props) => <TokenAmountCell amount={props.getValue()} />,
    sortingFn: sortBnValueForNomineeOrValidator,
  }),
  columnHelper.accessor('nominatorCount', {
    header: () => <HeaderCell title="Nominations" className="justify-center" />,
    cell: (props) => (
      <StringCell value={props.getValue().toString()} className="text-start" />
    ),
  }),
  columnHelper.accessor('commission', {
    header: () => <HeaderCell title="Commission" className="justify-center" />,
    cell: (props) => (
      <PercentageCell fractional={calculateCommission(props.getValue())} />
    ),
    sortingFn: sortBnValueForNomineeOrValidator,
  }),
];

export type NominationsTableProps = {
  nominees: Nominee[];
  pageSize: number;
};

const NominationsTable: FC<NominationsTableProps> = ({
  nominees,
  pageSize,
}) => {
  const [sorting, setSorting] = useState<SortingState>([
    // Default sorting by total stake amount in descending order
    { id: 'totalStakeAmount', desc: true },
  ]);

  const table = useReactTable({
    data: nominees,
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
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    enableSortingRemoval: false,
  });

  return (
    <div className="overflow-hidden border rounded-lg bg-mono-0 dark:bg-mono-180 border-mono-40 dark:border-mono-160">
      <Table
        thClassName="border-t-0 bg-mono-0"
        paginationClassName="bg-mono-0 dark:bg-mono-180 pl-6"
        tableProps={table}
        isPaginated
        totalRecords={nominees.length}
      />
    </div>
  );
};

export default NominationsTable;
