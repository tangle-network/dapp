'use client';

import { BN } from '@polkadot/util';
import {
  type Column,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingColumn,
  type SortingState,
  type TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDropDownFill, ArrowDropUpFill, Search } from '@webb-tools/icons';
import {
  Avatar,
  CheckBox,
  Chip,
  CopyWithTooltip,
  fuzzyFilter,
  Input,
  shortenString,
  Table,
  Typography,
} from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import React, {
  FC,
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ContainerSkeleton } from '../../components';
import { Validator } from '../../types';
import { HeaderCell } from '../tableCells';
import type { ValidatorListTableProps } from './types';

const DEFAULT_PAGINATION: PaginationState = {
  pageIndex: 0,
  pageSize: 20,
};

const columnHelper = createColumnHelper<Validator>();

const ValidatorListTable_: FC<ValidatorListTableProps> = ({
  data,
  setSelectedValidators,
}) => {
  const [searchValue, setSearchValue] = useState('');

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [pagination, setPagination] =
    React.useState<PaginationState>(DEFAULT_PAGINATION);

  const toggleSortSelectionHandlerRef = useRef<
    SortingColumn<Validator>['toggleSorting'] | null
  >(null);

  // Sync the selected validators with the parent state
  useEffect(() => {
    startTransition(() => {
      setSelectedValidators(new Set(Object.keys(rowSelection)));
    });
  }, [rowSelection, setSelectedValidators]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('address', {
        header: ({ header }) => {
          toggleSortSelectionHandlerRef.current = header.column.toggleSorting;
          return <HeaderCell title="Validator" className="justify-start" />;
        },
        cell: (props) => {
          const address = props.getValue();
          const identity = props.row.original.identityName;

          return (
            <div className="flex items-center gap-2">
              <CheckBox
                wrapperClassName="!block !min-h-auto cursor-pointer"
                className="cursor-pointer"
                isChecked={props.row.getIsSelected()}
                onChange={props.row.getToggleSelectedHandler()}
              />

              <div className="flex items-center space-x-1">
                <Avatar
                  sourceVariant="address"
                  value={address}
                  theme="substrate"
                >
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
            </div>
          );
        },
        // Sort the selected validators first
        sortingFn: (rowA, rowB) => {
          const rowASelected = rowA.getIsSelected();
          const rowBSelected = rowB.getIsSelected();

          if (rowASelected && !rowBSelected) {
            return -1;
          }

          if (!rowASelected && rowBSelected) {
            return 1;
          }

          return 0;
        },
      }),
      columnHelper.accessor('effectiveAmountStaked', {
        header: ({ header }) => (
          <div
            className="flex items-center justify-center cursor-pointer"
            onClick={header.column.getToggleSortingHandler()}
          >
            <HeaderCell title="Total Staked" className="flex-none block" />

            <SortArrow column={header.column} />
          </div>
        ),
        cell: (props) => (
          <div className="flex items-center justify-center">
            <Chip color="dark-grey">{props.getValue()}</Chip>
          </div>
        ),
        sortingFn,
      }),
      columnHelper.accessor('delegations', {
        header: ({ header }) => (
          <div
            className="flex items-center justify-center cursor-pointer"
            onClick={header.column.getToggleSortingHandler()}
          >
            <HeaderCell title="Nominations" className="flex-none block" />

            <SortArrow column={header.column} />
          </div>
        ),
        cell: (props) => (
          <div className="flex items-center justify-center">
            <Chip color="dark-grey">{props.getValue()}</Chip>
          </div>
        ),
        sortingFn,
      }),
      columnHelper.accessor('commission', {
        header: ({ header }) => (
          <div
            className="flex items-center justify-center cursor-pointer"
            onClick={header.column.getToggleSortingHandler()}
          >
            <HeaderCell title="Commission" className="flex-none block" />

            <SortArrow column={header.column} />
          </div>
        ),
        cell: (props) => (
          <div className="flex items-center justify-center">
            <Chip color="dark-grey">
              {Number(props.getValue()).toFixed(2)}%
            </Chip>
          </div>
        ),
        sortingFn,
      }),
      columnHelper.accessor('identityName', {
        header: () => <HeaderCell title="Identity" />,
        cell: (props) => props.getValue(),
      }),
    ],
    []
  );

  const tableProps = useMemo<TableOptions<Validator>>(
    () => ({
      data,
      columns,
      state: {
        columnVisibility: {
          identityName: false,
        },
        sorting,
        rowSelection,
        pagination,
        globalFilter: searchValue,
      },
      enableRowSelection: true,
      onPaginationChange: setPagination,
      onGlobalFilterChange: (props) => {
        setPagination(DEFAULT_PAGINATION);
        setSearchValue(props);
      },
      onRowSelectionChange: (props) => {
        toggleSortSelectionHandlerRef.current?.(false);
        setRowSelection(props);
      },
      onSortingChange: (updaterOrValue) => {
        if (typeof updaterOrValue === 'function') {
          setSorting((prev) => {
            const newSorting = updaterOrValue(prev);

            // Modify the sorting state to always sort by the selected validators first
            if (newSorting.length === 0) {
              return [
                {
                  id: 'address',
                  desc: false,
                },
              ];
            } else if (newSorting[0].id === 'address') {
              return newSorting;
            } else {
              return [
                {
                  id: 'address',
                  desc: false,
                },
                ...newSorting,
              ];
            }
          });
        } else {
          setSorting(updaterOrValue);
        }
      },
      filterFns: {
        fuzzy: fuzzyFilter,
      },
      globalFilterFn: fuzzyFilter,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getRowId: (row) => row.address,
      autoResetPageIndex: false,
    }),
    [columns, data, pagination, rowSelection, searchValue, sorting]
  );

  const table = useReactTable(tableProps);

  return (
    <>
      <div className="flex flex-col gap-2">
        <Input
          id="token"
          rightIcon={<Search className="mr-2" />}
          placeholder="Search validators..."
          value={searchValue}
          onChange={(val) => setSearchValue(val)}
          className="mb-1"
        />

        {data.length === 0 ? (
          <ContainerSkeleton className="max-h-[340px] w-full" />
        ) : (
          <Table
            tableClassName={cx('[&_tr]:[overflow-anchor:_none]')}
            thClassName="border-t-0 py-3 sticky top-0"
            trClassName="cursor-pointer"
            tdClassName="py-2 border-t-0"
            paginationClassName="bg-mono-0 dark:bg-mono-180 p-2"
            tableWrapperClassName="max-h-[340px] overflow-y-scroll"
            tableProps={table}
            isPaginated
          />
        )}
      </div>

      <Typography
        variant="body1"
        fw="normal"
        className="text-mono-200 dark:text-mono-0"
      >
        Selected: {Object.keys(rowSelection).length}/
        {table.getPreFilteredRowModel().rows.length}
      </Typography>
    </>
  );
};

export const ValidatorListTable = React.memo(ValidatorListTable_);

type ColumnIdAssertFn = (
  columnId: string
) => asserts columnId is keyof Validator;

const assertColumnId: ColumnIdAssertFn = (columnId) => {
  if (
    !['address', 'effectiveAmountStaked', 'delegations', 'commission'].includes(
      columnId
    )
  ) {
    throw new Error(`Invalid columnId: ${columnId}`);
  }
};

const sortingFn = (
  rowA: Row<Validator>,
  rowB: Row<Validator>,
  columnId: string
) => {
  assertColumnId(columnId);

  if (columnId === 'effectiveAmountStaked') {
    const totalStakedA = new BN(rowA.original.effectiveAmountStakedRaw);
    const totalStakedB = new BN(rowB.original.effectiveAmountStakedRaw);

    const result = totalStakedA.sub(totalStakedB);

    return result.ltn(0) ? -1 : result.gtn(0) ? 1 : 0;
  }

  const rowAValue = Number(rowA.original[columnId]);
  const rowBValue = Number(rowB.original[columnId]);

  return rowAValue - rowBValue;
};

const SortArrow: FC<{ column: Column<Validator, string> }> = ({ column }) => {
  const isSorted = column.getIsSorted();

  if (!isSorted) {
    return null;
  }

  return isSorted === 'asc' ? (
    <ArrowDropUpFill className="cursor-pointer" size="lg" />
  ) : (
    <ArrowDropDownFill className="cursor-pointer" size="lg" />
  );
};
