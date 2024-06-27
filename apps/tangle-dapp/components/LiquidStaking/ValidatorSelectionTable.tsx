import { BN } from '@polkadot/util';
import {
  type Column,
  type ColumnSort,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type Row,
  RowSelectionState,
  type SortingColumn,
  type SortingState,
  type TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowDropDownFill,
  ArrowDropUpFill,
  InformationLineFill,
} from '@webb-tools/icons';
import {
  Alert,
  Avatar,
  CheckBox,
  Chip,
  CopyWithTooltip,
  ExternalLinkIcon,
  fuzzyFilter,
  InfoItem,
  Pagination,
  shortenString,
  Table,
  TData,
  THeader,
  Typography,
} from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import {
  Dispatch,
  FC,
  SetStateAction,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { twMerge } from 'tailwind-merge';

import { Validator } from '../../types/liquidStaking';
import { HeaderCell } from '../tableCells';

type ValidatorSelectionTableProps = {
  validators: Validator[];
  defaultSelectedValidators: string[];
  setSelectedValidators: Dispatch<SetStateAction<Set<string>>>;
  isLoading: boolean;
};

const DEFAULT_PAGINATION: PaginationState = {
  pageIndex: 0,
  pageSize: 10,
};

const SELECTED_VALIDATORS_COLUMN_SORT = {
  id: 'address',
  desc: false,
} as const satisfies ColumnSort;

const columnHelper = createColumnHelper<Validator>();

const ValidatorSelectionTable = ({
  validators,
  defaultSelectedValidators,
  setSelectedValidators,
  isLoading,
}: ValidatorSelectionTableProps) => {
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
          return (
            <Typography
              variant="body2"
              fw="semibold"
              className="text-mono-120 dark:text-mono-120"
            >
              {' '}
              Validator
            </Typography>
          );
        },
        cell: (props) => {
          const address = props.getValue();
          const identity = props.row.original.identity ?? address;

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

                <Typography
                  variant="body2"
                  fw="normal"
                  className="truncate text-mono-200 dark:text-mono-0"
                >
                  {identity === address ? shortenString(address, 6) : identity}
                </Typography>

                <CopyWithTooltip
                  textToCopy={address}
                  isButton={false}
                  className="cursor-pointer"
                />

                <ExternalLinkIcon href="" />
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
      columnHelper.accessor('totalValueStaked', {
        header: ({ header }) => (
          <div
            className="flex items-center justify-center cursor-pointer"
            onClick={header.column.getToggleSortingHandler()}
          >
            <Typography
              variant="body2"
              fw="semibold"
              className="text-mono-120 dark:text-mono-120"
            >
              {' '}
              Total Staked
            </Typography>

            <SortArrow column={header.column} />
          </div>
        ),
        cell: (props) => (
          <div className="flex items-center justify-center">
            <Typography
              variant="body2"
              fw="normal"
              className="text-mono-200 dark:text-mono-0"
            >
              {props.getValue() + ' DOT'}
            </Typography>
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
            <Typography
              variant="body2"
              fw="semibold"
              className="text-mono-120 dark:text-mono-120"
            >
              {' '}
              Commission
            </Typography>

            <SortArrow column={header.column} />
          </div>
        ),
        cell: (props) => (
          <div className="flex items-center justify-center">
            <Typography
              variant="body2"
              fw="normal"
              className="text-mono-200 dark:text-mono-0"
            >
              {props.getValue() + '%'}
            </Typography>
          </div>
        ),
        sortingFn,
      }),
    ],
    [],
  );

  const tableProps = useMemo<TableOptions<Validator>>(
    () => ({
      data: validators,
      columns,
      state: {
        columnVisibility: {
          identityName: false,
        },
        sorting,
        pagination,
      },
      enableRowSelection: true,
      onPaginationChange: setPagination,
      onGlobalFilterChange: () => {
        setPagination(DEFAULT_PAGINATION);
      },
      onRowSelectionChange: () => {
        toggleSortSelectionHandlerRef.current?.(false);
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
    [validators, columns, sorting, pagination],
  );

  const table = useReactTable(tableProps);

  return (
    <div className="flex flex-col">
      <div className="w-full overflow-x-auto bg-validator_table dark:bg-validator_table_dark rounded-2xl border-[1px] border-mono-0 dark:border-mono-160 px-8 py-6 flex flex-col justify-between min-h-[528px]">
        <div>
          <table className="w-full table-auto">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={twMerge(
                        'border-b border-b-mono-40 dark:border-b-mono-140 pb-2 sticky top-0 ',
                      )}
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
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className={twMerge('group/tr', '')}>
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

          {validators.length > 10 && (
            <Pagination
              itemsPerPage={table.getState().pagination.pageSize}
              totalItems={Math.max(
                table.getPrePaginationRowModel().rows.length,
                validators.length,
              )}
              page={table.getState().pagination.pageIndex + 1}
              totalPages={table.getPageCount()}
              canPreviousPage={table.getCanPreviousPage()}
              previousPage={table.previousPage}
              canNextPage={table.getCanNextPage()}
              nextPage={table.nextPage}
              setPageIndex={table.setPageIndex}
              title="Validators"
              className="!px-0 !py-2"
            />
          )}
        </div>

        <div className="flex items-start gap-2">
          <InformationLineFill width={16} height={16} />
          <Typography variant="body2">
            The validator(s) you select determine the unique liquid staking
            token (tgDOT) received & the share of pool liquidity and rewards.
            (Learn More)
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default ValidatorSelectionTable;

type ColumnIdAssertFn = (
  columnId: string,
) => asserts columnId is keyof Validator;

const assertColumnId: ColumnIdAssertFn = (columnId) => {
  if (
    ![
      'address',
      'identity',
      'totalValueStaked',
      'annualPercentageYield',
      'commission',
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
