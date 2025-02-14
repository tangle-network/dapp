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
import { sortByAddressOrIdentity } from '@webb-tools/tangle-shared-ui/components/tables/utils';
import {
  AmountFormatStyle,
  Avatar,
  CheckBox,
  CopyWithTooltip,
  fuzzyFilter,
  Input,
  shortenString,
  Table,
  Typography,
} from '@webb-tools/webb-ui-components';
import { TableVariant } from '@webb-tools/webb-ui-components/components/Table/types';
import formatPercentage from '@webb-tools/webb-ui-components/utils/formatPercentage';
import assertSubstrateAddress from '@webb-tools/webb-ui-components/utils/assertSubstrateAddress';
import cx from 'classnames';
import {
  FC,
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
  Dispatch,
  SetStateAction,
} from 'react';

import calculateCommission from '../utils/calculateCommission';
import { HeaderCell } from './tableCells';
import TokenAmountCell from './tableCells/TokenAmountCell';
import addCommasToNumber from '@webb-tools/webb-ui-components/utils/addCommasToNumber';
import SkeletonRows from '@webb-tools/tangle-shared-ui/components/SkeletonRows';
import sortByBn from '../utils/sortByBn';
import filterTableRowBy from '../utils/filterTableRowBy';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import { Validator } from '@webb-tools/tangle-shared-ui/types';

type Props = {
  allValidators: Validator[];
  isLoading: boolean;
  defaultSelectedValidators: SubstrateAddress[];
  setSelectedValidators: Dispatch<SetStateAction<Set<SubstrateAddress>>>;
  pageSize?: number;
};

const COLUMN_HELPER = createColumnHelper<Validator>();

const ValidatorSelectionTable: FC<Props> = ({
  allValidators,
  isLoading,
  defaultSelectedValidators,
  setSelectedValidators,
  pageSize = 20,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

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

  // Sync the selected validators with the parent state.
  useEffect(() => {
    startTransition(() => {
      setSelectedValidators(
        new Set(Object.keys(rowSelection).map(assertSubstrateAddress)),
      );
    });
  }, [rowSelection, setSelectedValidators]);

  const columns = useMemo(
    () => [
      COLUMN_HELPER.accessor('address', {
        header: () => (
          <HeaderCell title="Validator" className="justify-start" />
        ),
        filterFn: filterTableRowBy((row) => [row.address, row.identityName]),
        sortingFn: (rowA, rowB, columnId) =>
          sortValidatorsBy(
            rowA,
            rowB,
            columnId,
            sortByAddressOrIdentity<Validator>(),
            isDesc,
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
                  {identity === undefined
                    ? shortenString(address, 6)
                    : identity}
                </Typography>

                <CopyWithTooltip
                  copyLabel="Copy Address"
                  textToCopy={address}
                  isButton={false}
                  iconClassName="!fill-mono-160 dark:!fill-mono-80"
                />
              </div>
            </div>
          );
        },
      }),
      COLUMN_HELPER.accessor('totalStakeAmount', {
        header: () => (
          <HeaderCell title="Total Staked" className="justify-start" />
        ),
        cell: (props) => (
          <TokenAmountCell
            amount={props.getValue()}
            className="text-mono-0"
            formatStyle={AmountFormatStyle.SHORT}
          />
        ),
        sortingFn: sortByBn((row) => row.totalStakeAmount),
      }),
      COLUMN_HELPER.accessor('nominatorCount', {
        header: () => (
          <HeaderCell title="Nominations" className="justify-start" />
        ),
        cell: (props) => (
          <Typography variant="body1">
            {addCommasToNumber(props.getValue())}
          </Typography>
        ),
        sortingFn: (rowA, rowB, columnId) =>
          sortValidatorsBy(
            rowA,
            rowB,
            columnId,
            (rowA, rowB) =>
              rowA.original.nominatorCount - rowB.original.nominatorCount,
            isDesc,
          ),
      }),
      COLUMN_HELPER.accessor('commission', {
        header: () => (
          <HeaderCell title="Commission" className="justify-start" />
        ),
        cell: (props) => (
          <Typography variant="body1">
            {formatPercentage(calculateCommission(props.getValue()))}
          </Typography>
        ),
        sortingFn: sortByBn((row) => row.commission),
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
            value: searchQuery,
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
    [allValidators, columns, rowSelection, searchQuery, sorting, pageSize],
  );

  const table = useReactTable(tableProps);

  if (isLoading) {
    return <SkeletonRows />;
  }

  const paginationLabel = `Selected validators: ${Object.keys(rowSelection).length}/${table.getPreFilteredRowModel().rows.length}`;

  return (
    <div className="flex flex-col gap-2">
      <Input
        id="search-validators-selection"
        rightIcon={<Search className="mr-2" />}
        placeholder="Search validators by identity or address..."
        value={searchQuery}
        onChange={setSearchQuery}
        className="mb-1"
        isControlled
      />

      {allValidators.length === 0 ? (
        <div className="h-[340px] flex items-center justify-center">
          <Typography variant="body1" fw="normal">
            No results found
          </Typography>
        </div>
      ) : (
        <Table
          variant={TableVariant.EMBEDDED_IN_MODAL}
          tableClassName={cx('[&_tr]:[overflow-anchor:_none]')}
          tableWrapperClassName="max-h-[340px] overflow-y-scroll"
          tableProps={table}
          isPaginated
          paginationLabelOverride={paginationLabel}
        />
      )}
    </div>
  );
};

const sortValidatorsBy = (
  rowA: Row<Validator>,
  rowB: Row<Validator>,
  columnId: string,
  sortFn: SortingFn<Validator>,
  isDesc: boolean,
) => {
  const rowASelected = rowA.getIsSelected();
  const rowBSelected = rowB.getIsSelected();

  // Prioritize selected validators by pinning them to the top.
  if (rowASelected && !rowBSelected) {
    return isDesc ? 1 : -1;
  } else if (!rowASelected && rowBSelected) {
    return isDesc ? -1 : 1;
  }

  return sortFn(rowA, rowB, columnId);
};

export default memo(ValidatorSelectionTable);
