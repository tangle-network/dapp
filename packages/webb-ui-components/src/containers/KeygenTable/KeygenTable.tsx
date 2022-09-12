import {
  ColumnDef,
  ColumnFiltersState,
  createColumnHelper,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  Table as RTTable,
  useReactTable,
} from '@tanstack/react-table';
import {
  Avatar,
  AvatarGroup,
  Button,
  CardTable,
  Collapsible,
  CollapsibleButton,
  CollapsibleContent,
  Filter,
  KeyValueWithButton,
  Slider,
  Table,
} from '@webb-dapp/webb-ui-components/components';
import { fuzzyFilter } from '@webb-dapp/webb-ui-components/components/Filter/utils';
import { Authority } from '@webb-dapp/webb-ui-components/components/KeyStatusCard/types';
import { fetchKeygenData } from '@webb-dapp/webb-ui-components/hooks';
import { KeygenType } from '@webb-dapp/webb-ui-components/types';
import { useEffect, useMemo, useState } from 'react';

const columnHelper = createColumnHelper<KeygenType>();

const columns: ColumnDef<KeygenType, any>[] = [
  columnHelper.accessor('height', {
    header: 'Height',
    enableColumnFilter: false,
  }),
  columnHelper.accessor('session', {
    header: 'Sesssion',
    enableColumnFilter: false,
  }),
  columnHelper.accessor('key', {
    header: 'Key',
    cell: (props) => <KeyValueWithButton isHiddenLabel keyValue={props.getValue<string>()} size='sm' />,
    enableColumnFilter: false,
  }),
  columnHelper.accessor('keygenThreshold', {
    header: 'Keygen Threshold',
  }),
  columnHelper.accessor('signatureThreshold', {
    header: 'Signature Threshold',
  }),
  columnHelper.accessor('authorities', {
    header: 'Authority Set',
    cell: (props) => (
      <AvatarGroup total={props.row.original.totalAuthorities}>
        {Object.values<Authority>(props.getValue()).map((au) => (
          <Avatar src={au.avatarUrl} alt={au.id} key={au.id} />
        ))}
      </AvatarGroup>
    ),
    enableColumnFilter: false,
  }),
  columnHelper.accessor('detailUrl', {
    header: '',
    cell: (props) => (
      <Button varirant='link' href={props.getValue<string>()} target='_blank' size='sm'>
        Details
      </Button>
    ),
    enableColumnFilter: false,
  }),
];

export const KeygenTable = () => {
  // Filters
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Pagination state
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const [dataQuery, setDataQuery] = useState<undefined | Awaited<ReturnType<typeof fetchKeygenData>>>();

  useEffect(() => {
    const updateData = async () => {
      const dataQuery = await fetchKeygenData({ pageIndex, pageSize });

      setDataQuery(dataQuery);
    };

    updateData();
  }, [pageIndex, pageSize]);

  const table = useReactTable<KeygenType>({
    data: dataQuery?.rows ?? ([] as KeygenType[]),
    columns,
    pageCount: dataQuery?.pageCount ?? -1,
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination,
      columnFilters,
      globalFilter,
    },
    onPaginationChange: setPagination,
    manualPagination: true,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: fuzzyFilter,
  });

  const headers = useMemo(
    () => table.getHeaderGroups().map((headerGroup) => headerGroup.headers.map((header) => header)),
    [table]
  );

  const [{ column: keygenFilterCol }, { column: signatureFilterCol }] = useMemo(
    () => headers[0].filter((header) => header.column.getCanFilter()),
    [headers]
  );

  return (
    <CardTable
      className='mt-6'
      leftTitle={
        <Filter
          searchText={globalFilter}
          onSearchChange={(nextValue: string | number) => {
            setGlobalFilter(nextValue.toString());
          }}
        >
          <Collapsible>
            <CollapsibleButton>Keygen Threshold</CollapsibleButton>
            <CollapsibleContent>
              <Slider
                max={keygenFilterCol.getFacetedMinMaxValues()?.[1]}
                defaultValue={keygenFilterCol.getFacetedMinMaxValues()}
                value={keygenFilterCol.getFilterValue() as [number, number]}
                onChange={(nextValue) => keygenFilterCol.setFilterValue(nextValue)}
                className='w-full min-w-0'
                hasLabel
              />
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleButton>Signature Threshold</CollapsibleButton>
            <CollapsibleContent>
              <Slider
                max={signatureFilterCol.getFacetedMinMaxValues()?.[1]}
                defaultValue={signatureFilterCol.getFacetedMinMaxValues()}
                value={signatureFilterCol.getFilterValue() as [number, number]}
                onChange={(nextValue) => signatureFilterCol.setFilterValue(nextValue)}
                className='w-full min-w-0'
                hasLabel
              />
            </CollapsibleContent>
          </Collapsible>
        </Filter>
      }
    >
      <Table
        tableProps={table as RTTable<unknown>}
        isPaginated
        paginationProps={{
          itemsPerPage: pageSize,
          totalItems: dataQuery?.totalItems,
          page: pageIndex + 1,
          totalPages: dataQuery?.pageCount,
          canPreviousPage: table.getCanPreviousPage(),
          previousPage: table.previousPage,
          canNextPage: table.getCanNextPage(),
          nextPage: table.nextPage,
          setPageIndex: table.setPageIndex,
        }}
      />
    </CardTable>
  );
};
