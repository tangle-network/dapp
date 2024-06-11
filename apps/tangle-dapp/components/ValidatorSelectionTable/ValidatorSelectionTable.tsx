'use client';

import { BN } from '@polkadot/util';
import {
  type Column,
  type ColumnSort,
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

import { Validator } from '../../types';
import calculateCommission from '../../utils/calculateCommission';
import { ContainerSkeleton } from '..';
import { HeaderCell } from '../tableCells';
import TokenAmountCell from '../tableCells/TokenAmountCell';
import { ValidatorSelectionTableProps } from './types';

const DEFAULT_PAGINATION: PaginationState = {
  pageIndex: 0,
  pageSize: 20,
};

const SELECTED_VALIDATORS_COLUMN_SORT = {
  id: 'address',
  desc: false,
} as const satisfies ColumnSort;

const columnHelper = createColumnHelper<Validator>();

const ValidatorSelectionTable: FC<ValidatorSelectionTableProps> = ({
  allValidators,
  defaultSelectedValidators,
  setSelectedValidators,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    defaultSelectedValidators.reduce((acc, address) => {
      acc[address] = true;
      return acc;
    }, {} as RowSelectionState),
  );
  const [sorting, setSorting] = useState<SortingState>([
    SELECTED_VALIDATORS_COLUMN_SORT,
  ]);

  const [pagination, setPagination] =
    useState<PaginationState>(DEFAULT_PAGINATION);

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
                />

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
      columnHelper.accessor('totalStakeAmount', {
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
            <Chip color="dark-grey" className="normal-case">
              <TokenAmountCell amount={props.getValue()} />
            </Chip>
          </div>
        ),
        sortingFn,
      }),
      columnHelper.accessor('nominatorCount', {
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
              {calculateCommission(props.getValue()).toFixed(2)}%
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
    [],
  );

  const tableProps = useMemo<TableOptions<Validator>>(
    () => ({
      data: allValidators,
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
              return [SELECTED_VALIDATORS_COLUMN_SORT];
            } else if (newSorting[0].id === 'address') {
              return newSorting;
            } else {
              return [SELECTED_VALIDATORS_COLUMN_SORT, ...newSorting];
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
    [columns, allValidators, pagination, rowSelection, searchValue, sorting],
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

        {allValidators.length === 0 ? (
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

type ColumnIdAssertFn = (
  columnId: string,
) => asserts columnId is keyof Validator;

const assertColumnId: ColumnIdAssertFn = (columnId) => {
  if (
    ![
      'address',
      'effectiveAmountStaked',
      'delegations',
      'commission',
      'nominatorCount',
      'totalStakeAmount',
    ].includes(columnId)
  ) {
    throw new Error(`Invalid columnId: ${columnId}`);
  }
};

const sortingFn = (
  rowA: Row<Validator>,
  rowB: Row<Validator>,
  columnId: string,
) => {
  assertColumnId(columnId);

  if (columnId === 'totalStakeAmount') {
    const totalStakedA = rowA.original.totalStakeAmount;
    const totalStakedB = rowB.original.totalStakeAmount;
    const result = totalStakedA.sub(totalStakedB);

    return result.ltn(0) ? -1 : result.gtn(0) ? 1 : 0;
  }

  // TODO: Avoid using Number() here, if it is a BN value, it should be compared as such.
  const rowAValue = Number(rowA.original[columnId]);
  const rowBValue = Number(rowB.original[columnId]);

  return rowAValue - rowBValue;
};

const SortArrow: FC<{ column: Column<Validator, BN | number> }> = ({
  column,
}) => {
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

export default React.memo(ValidatorSelectionTable);
