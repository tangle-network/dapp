import {
  Column,
  ColumnDef,
  ColumnSort,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  RowSelectionState,
  SortingColumn,
  SortingState,
  TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowDropDownFill,
  ArrowDropUpFill,
  Search,
  Spinner,
} from '@webb-tools/icons';
import {
  fuzzyFilter,
  Input,
  Pagination,
  Typography,
} from '@webb-tools/webb-ui-components';
import {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useLiquidStakingSelectionTableColumns } from '../../hooks/LiquidStaking/useLiquidStakingSelectionTableColumns';
import {
  Collator,
  Dapp,
  LiquidStakingItem,
  LiquidStakingItemType,
  Validator,
  VaultOrStakePool,
} from '../../types/liquidStaking';

type LiquidStakingSelectionTableProps = {
  data: Validator[] | VaultOrStakePool[] | Dapp[] | Collator[];
  dataType: LiquidStakingItem;
  setSelectedItems: Dispatch<SetStateAction<Set<string>>>;
  isLoading: boolean;
};

const DEFAULT_PAGINATION: PaginationState = {
  pageIndex: 0,
  pageSize: 10,
};

const SELECTED_ITEMS_COLUMN_SORT = {
  id: 'id',
  desc: false,
} as const satisfies ColumnSort;

export const LiquidStakingSelectionTable: FC<
  LiquidStakingSelectionTableProps
> = ({ data, dataType, setSelectedItems, isLoading }) => {
  console.debug('LiquidStakingSelectionTable', data, dataType, isLoading);
  const [searchValue, setSearchValue] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([
    SELECTED_ITEMS_COLUMN_SORT,
  ]);
  const [pagination, setPagination] =
    useState<PaginationState>(DEFAULT_PAGINATION);

  const toggleSortSelectionHandlerRef = useRef<
    SortingColumn<any>['toggleSorting'] | null
  >(null);

  useEffect(() => {
    setSelectedItems(new Set(Object.keys(rowSelection)));
  }, [rowSelection, setSelectedItems]);

  const columns = useLiquidStakingSelectionTableColumns(
    toggleSortSelectionHandlerRef,
    dataType,
  ) as ColumnDef<LiquidStakingItemType, unknown>[];

  const tableTitle = useMemo(() => {
    switch (dataType) {
      case LiquidStakingItem.VALIDATOR:
        return 'Validators';
      case LiquidStakingItem.DAPP:
        return 'DApp';
      case LiquidStakingItem.VAULT_OR_STAKE_POOL:
        return 'Vault or Stake Pool';
      case LiquidStakingItem.COLLATOR:
        return 'Collators';
    }
  }, [dataType]);

  const itemText = useMemo(() => {
    switch (dataType) {
      case LiquidStakingItem.VALIDATOR:
        return 'Validator';
      case LiquidStakingItem.DAPP:
        return 'dApp';
      case LiquidStakingItem.VAULT_OR_STAKE_POOL:
        return 'Vault/Pool';
      case LiquidStakingItem.COLLATOR:
        return 'Collator';
    }
  }, [dataType]);

  const tableData = useMemo(() => (isLoading ? [] : data), [data, isLoading]);
  const tableColumns = useMemo(
    () => (isLoading ? [] : columns),
    [columns, isLoading],
  );

  const tableIsLoading = useMemo(() => {
    return (
      (data.length > 0 && data[0].itemType !== dataType) || isLoading === true
    );
  }, [data, dataType, isLoading]);

  const tableProps = useMemo<TableOptions<LiquidStakingItemType>>(
    () => ({
      data: tableData,
      columns: tableColumns,
      state: {
        sorting,
        rowSelection,
        pagination,
        globalFilter: searchValue,
      },
      enableRowSelection: true,
      onPaginationChange: setPagination,
      onGlobalFilterChange: (value) => {
        setPagination(DEFAULT_PAGINATION);
        setSearchValue(value);
      },
      onRowSelectionChange: (value) => {
        toggleSortSelectionHandlerRef.current?.(false);
        setRowSelection(value);
      },
      onSortingChange: (updaterOrValue) => {
        setSorting((prev) => {
          const newSorting =
            typeof updaterOrValue === 'function'
              ? updaterOrValue(prev)
              : updaterOrValue;
          return newSorting.length === 0
            ? [SELECTED_ITEMS_COLUMN_SORT]
            : newSorting[0].id === 'id'
              ? newSorting
              : [SELECTED_ITEMS_COLUMN_SORT, ...newSorting];
        });
      },
      filterFns: { fuzzy: fuzzyFilter },
      globalFilterFn: fuzzyFilter,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getRowId: (row) => row.id,
      autoResetPageIndex: false,
      enableMultiRowSelection:
        dataType === LiquidStakingItem.VALIDATOR ||
        dataType === LiquidStakingItem.COLLATOR,
    }),
    [
      dataType,
      pagination,
      rowSelection,
      searchValue,
      sorting,
      tableColumns,
      tableData,
    ],
  );

  const table = useReactTable(tableProps);

  return (
    <div className="relative">
      <div className="w-full overflow-x-auto bg-validator_table dark:bg-validator_table_dark rounded-2xl border-[1px] border-mono-0 dark:border-mono-160 px-8 py-6 flex flex-col justify-between min-h-[600px]">
        {!tableIsLoading ? (
          <>
            <div className="flex flex-col gap-2">
              <Typography
                variant="body1"
                fw="bold"
                className="text-mono-200 dark:text-mono-0"
              >
                Select {tableTitle}
              </Typography>

              <Input
                id="search"
                rightIcon={<Search className="mr-2" />}
                placeholder="Search"
                value={searchValue}
                onChange={(val) => setSearchValue(val)}
                className="mb-1"
                debounceTime={300}
              />

              <table>
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="border-b border-b-mono-40 dark:border-b-mono-140 pb-2 sticky top-0"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="overflow-y-scroll max-h-[400px]">
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="group/tr">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="h-[44px]">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.length > DEFAULT_PAGINATION.pageSize && (
              <Pagination
                itemsPerPage={table.getState().pagination.pageSize}
                totalItems={Math.max(
                  table.getPrePaginationRowModel().rows.length,
                  data.length,
                )}
                page={table.getState().pagination.pageIndex + 1}
                totalPages={table.getPageCount()}
                canPreviousPage={table.getCanPreviousPage()}
                previousPage={table.previousPage}
                canNextPage={table.getCanNextPage()}
                nextPage={table.nextPage}
                setPageIndex={table.setPageIndex}
                title={itemText + 's'}
                className="!px-0 !py-0 !pt-6"
              />
            )}
          </>
        ) : (
          <div className="flex justify-center items-center min-h-[600px]">
            <div className="flex items-center justify-center gap-1">
              <Spinner size="md" />
              <Typography
                variant="body1"
                fw="normal"
                className="text-mono-200 dark:text-mono-0"
              >
                Fetching {itemText}s...
              </Typography>
            </div>
          </div>
        )}
      </div>

      {/* <IconButton
        onClick={() => console.debug('Refresh')}
        className="absolute top-[-12px] right-[-12px] border rounded-full shadow-md bg-mono-20 dark:bg-mono-160 border-mono-60 dark:border-mono-120 w-fit"
      >
        <RefreshLineIcon />
      </IconButton> */}
    </div>
  );
};

export const SortArrow: FC<{ column: Column<any, any> }> = ({ column }) => {
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
