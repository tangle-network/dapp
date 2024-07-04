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
  InformationLine,
  LineChartIcon,
  Spinner,
} from '@webb-tools/icons';
import {
  Avatar,
  Button,
  CheckBox,
  CopyWithTooltip,
  ExternalLinkIcon,
  fuzzyFilter,
  Pagination,
  shortenString,
  Typography,
} from '@webb-tools/webb-ui-components';
import {
  Dispatch,
  FC,
  SetStateAction,
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { twMerge } from 'tailwind-merge';

import { Collator, Validator } from '../../types/liquidStaking';
import calculateCommission from '../../utils/calculateCommission';
import formatBn from '../../utils/formatBn';

type ValidatorAndCollatorSelectionTableProps = {
  data: Validator[] | Collator[];
  setSelectedvalidatorsOrCollators: Dispatch<SetStateAction<Set<string>>>;
  tableType: 'validators' | 'collators';
  isLoading: boolean;
};

const DEFAULT_PAGINATION: PaginationState = {
  pageIndex: 0,
  pageSize: 8,
};

const SELECTED_VALIDATORS_COLUMN_SORT = {
  id: 'address',
  desc: false,
} as const satisfies ColumnSort;

const validatorColumnHelper = createColumnHelper<Validator>();
const collatorColumnHelper = createColumnHelper<Collator>();

const ValidatorSelectionTable = ({
  data,
  setSelectedvalidatorsOrCollators,
  tableType,
  isLoading,
}: ValidatorAndCollatorSelectionTableProps) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

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
      setSelectedvalidatorsOrCollators(new Set(Object.keys(rowSelection)));
    });
  }, [rowSelection, setSelectedvalidatorsOrCollators]);

  const validatorColumns = useMemo(
    () => [
      validatorColumnHelper.accessor('address', {
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
      validatorColumnHelper.accessor('totalValueStaked', {
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
              {formatBn(props.getValue(), props.row.original.chainDecimals) +
                ` ${props.row.original.tokenSymbol}`}
            </Typography>
          </div>
        ),
        sortingFn,
      }),
      validatorColumnHelper.accessor('commission', {
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
              {calculateCommission(props.getValue()).toFixed(2) + '%'}
            </Typography>
          </div>
        ),
        sortingFn,
      }),
      validatorColumnHelper.accessor('annualPercentageYield', {
        header: () => <span></span>,
        cell: () => {
          return <ValidatorStatsButton href="" />;
        },
        sortingFn,
      }),
    ],
    [],
  );

  const collatorColumns = useMemo(
    () => [
      collatorColumnHelper.accessor('address', {
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
    ],
    [],
  );

  const validatorTableProps = useMemo<TableOptions<Validator>>(
    () => ({
      data: data as Validator[],
      columns: validatorColumns,
      state: {
        columnVisibility: {
          identityName: false,
        },
        sorting,
        rowSelection,
        pagination,
      },
      enableRowSelection: true,
      onPaginationChange: setPagination,
      onGlobalFilterChange: () => {
        setPagination(DEFAULT_PAGINATION);
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
    [data, validatorColumns, sorting, rowSelection, pagination],
  );

  const collatorTableProps = useMemo<TableOptions<Collator>>(
    () => ({
      data: data as Collator[],
      columns: collatorColumns,
      state: {
        columnVisibility: {
          identityName: false,
        },
        sorting,
        rowSelection,
        pagination,
      },
      enableRowSelection: true,
      onPaginationChange: setPagination,
      onGlobalFilterChange: () => {
        setPagination(DEFAULT_PAGINATION);
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
    [data, collatorColumns, sorting, rowSelection, pagination],
  );

  const tableProps = useMemo(() => {
    return tableType === 'validators'
      ? validatorTableProps
      : collatorTableProps;
  }, [tableType, validatorTableProps, collatorTableProps]);

  const table = useReactTable(tableProps);

  return (
    <div className="flex flex-col">
      <div className="w-full overflow-x-auto bg-validator_table dark:bg-validator_table_dark rounded-2xl border-[1px] border-mono-0 dark:border-mono-160 px-8 py-6 flex flex-col justify-between min-h-[600px]">
        {!isLoading ? (
          <>
            <div className="flex flex-col gap-4">
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

              {data.length > 10 && (
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
                  title={
                    tableType === 'validators' ? 'Validators' : 'Collators'
                  }
                  className="!px-0 !py-2"
                />
              )}
            </div>

            <div className="flex items-start gap-2">
              <InformationLine width={16} height={16} />
              <Typography
                variant="body3"
                fw="normal"
                className="text-mono-120 dark:text-mono-80"
              >
                The validator(s) you select determine the unique liquid staking
                token (tgDOT) received & the share of pool liquidity and
                rewards. (Learn More)
              </Typography>
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center min-h-[600px]">
            <div className="flex items-center justify-center gap-1">
              <Spinner size="md" />
              <Typography
                variant="body2"
                fw="normal"
                className="text-mono-200 dark:text-mono-0"
              >
                Loading on-chain data...
              </Typography>
            </div>
          </div>
        )}
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

/** @internal */
const ValidatorStatsButton = ({ href }: { href: string }) => {
  return (
    <Button
      variant="utility"
      className="bg-blue-0 dark:bg-blue-120"
      onClick={() => window.open(href, '_blank')}
    >
      <LineChartIcon
        width={16}
        height={16}
        className="fill-blue-60 dark:fill-blue-40"
      />
    </Button>
  );
};
