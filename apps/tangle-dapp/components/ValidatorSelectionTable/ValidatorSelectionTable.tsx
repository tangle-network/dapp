'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Row,
  type RowSelectionState,
  type SortingColumn,
  type SortingFn,
  type SortingState,
  type TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import { Search } from '@webb-tools/icons';
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
import {
  getSortAddressOrIdentityFnc,
  sortBnValueForNomineeOrValidator,
} from '../../utils/table';
import { ContainerSkeleton } from '..';
import { HeaderCell } from '../tableCells';
import TokenAmountCell from '../tableCells/TokenAmountCell';
import { ValidatorSelectionTableProps } from './types';

const columnHelper = createColumnHelper<Validator>();

const ValidatorSelectionTable: FC<ValidatorSelectionTableProps> = ({
  allValidators,
  isLoading,
  defaultSelectedValidators,
  setSelectedValidators,
  pageSize = 20,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    defaultSelectedValidators.reduce((acc, address) => {
      acc[address] = true;
      return acc;
    }, {} as RowSelectionState),
  );
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'totalStakeAmount',
      desc: true,
    },
  ]);

  const isDesc = useMemo(() => sorting[0].desc, [sorting]);

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
        header: () => (
          <HeaderCell title="Validator" className="justify-start" />
        ),
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
                  iconClassName="!fill-mono-160 dark:!fill-mono-80"
                />
              </div>
            </div>
          );
        },
        sortingFn: (rowA, rowB, columnId) =>
          sortValidatorsBasedOnSortingFn(
            rowA,
            rowB,
            columnId,
            getSortAddressOrIdentityFnc<Validator>(),
            isDesc,
          ),
        filterFn: (row, _, filterValue) => {
          const { address, identityName } = row.original;
          return (
            address.toLowerCase().includes(filterValue.toLowerCase()) ||
            identityName.toLowerCase().includes(filterValue.toLowerCase())
          );
        },
      }),
      columnHelper.accessor('totalStakeAmount', {
        header: () => (
          <HeaderCell title="Total Staked" className="justify-start" />
        ),
        cell: (props) => (
          <div className="flex items-center justify-start">
            <Chip color="dark-grey" className="normal-case">
              <TokenAmountCell
                amount={props.getValue()}
                className="text-mono-0"
              />
            </Chip>
          </div>
        ),
        sortingFn: (rowA, rowB, columnId) =>
          sortValidatorsBasedOnSortingFn(
            rowA,
            rowB,
            columnId,
            sortBnValueForNomineeOrValidator,
            isDesc,
          ),
      }),
      columnHelper.accessor('nominatorCount', {
        header: () => (
          <HeaderCell title="Nominations" className="justify-start" />
        ),
        cell: (props) => (
          <div className="flex items-center justify-start">
            <Chip color="dark-grey">{props.getValue()}</Chip>
          </div>
        ),
        sortingFn: (rowA, rowB, columnId) =>
          sortValidatorsBasedOnSortingFn(
            rowA,
            rowB,
            columnId,
            (rowA, rowB) =>
              rowA.original.nominatorCount - rowB.original.nominatorCount,
            isDesc,
          ),
      }),
      columnHelper.accessor('commission', {
        header: () => (
          <HeaderCell title="Commission" className="justify-start" />
        ),
        cell: (props) => (
          <div className="flex items-center justify-start">
            <Chip color="dark-grey">
              {calculateCommission(props.getValue()).toFixed(2)}%
            </Chip>
          </div>
        ),
        sortingFn: (rowA, rowB, columnId) =>
          sortValidatorsBasedOnSortingFn(
            rowA,
            rowB,
            columnId,
            sortBnValueForNomineeOrValidator,
            isDesc,
          ),
      }),
      columnHelper.accessor('identityName', {
        header: () => <HeaderCell title="Identity" />,
        cell: (props) => props.getValue(),
      }),
    ],
    [isDesc],
  );

  const tableProps = useMemo<TableOptions<Validator>>(
    () => ({
      data: allValidators,
      columns,
      initialState: {
        pagination: {
          pageSize,
        },
      },
      state: {
        columnVisibility: {
          identityName: false,
        },
        sorting,
        rowSelection,
        columnFilters: [
          {
            id: 'address',
            value: searchValue,
          },
        ],
      },
      enableRowSelection: true,
      onRowSelectionChange: (props) => {
        toggleSortSelectionHandlerRef.current?.(false);
        setRowSelection(props);
        // Force re-sort after selecting an item
        setSorting((prevSorting) => [...prevSorting]);
      },
      onSortingChange: setSorting,
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
      enableSortingRemoval: false,
    }),
    [allValidators, columns, rowSelection, searchValue, sorting, pageSize],
  );

  const table = useReactTable(tableProps);

  return (
    <>
      <div className="flex flex-col gap-2">
        <Input
          id="search-validators-selection"
          rightIcon={<Search className="mr-2" />}
          placeholder="Search validators..."
          value={searchValue}
          onChange={(val) => setSearchValue(val)}
          className="mb-1"
          isControlled
        />

        {isLoading && <ContainerSkeleton className="h-[340px] w-full" />}

        {!isLoading &&
          (allValidators.length === 0 ? (
            <div className="h-[340px] flex items-center justify-center">
              <Typography variant="body1" fw="normal">
                No results found
              </Typography>
            </div>
          ) : (
            <Table
              tableClassName={cx('[&_tr]:[overflow-anchor:_none]')}
              thClassName="z-10 border-t-0 py-3 sticky top-0"
              trClassName="cursor-pointer"
              tdClassName="py-2 border-t-0"
              paginationClassName="bg-mono-0 dark:bg-mono-180 p-2"
              tableWrapperClassName="max-h-[340px] overflow-y-scroll"
              tableProps={table}
              isPaginated
            />
          ))}

        {!isLoading && allValidators.length > 0 && (
          <Typography
            variant="body1"
            fw="normal"
            className="text-mono-200 dark:text-mono-0"
          >
            Selected: {Object.keys(rowSelection).length}/
            {table.getPreFilteredRowModel().rows.length}
          </Typography>
        )}
      </div>
    </>
  );
};

export default React.memo(ValidatorSelectionTable);

function sortValidatorsBasedOnSortingFn(
  rowA: Row<Validator>,
  rowB: Row<Validator>,
  columnId: string,
  sortFn: SortingFn<Validator>,
  isDesc: boolean,
) {
  const rowASelected = rowA.getIsSelected();
  const rowBSelected = rowB.getIsSelected();

  // Prioritize selected validators
  if (rowASelected && !rowBSelected) return isDesc ? 1 : -1;
  if (!rowASelected && rowBSelected) return isDesc ? -1 : 1;

  return sortFn(rowA, rowB, columnId);
}
