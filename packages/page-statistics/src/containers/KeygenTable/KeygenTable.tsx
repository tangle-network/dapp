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
  Drawer,
  DrawerContent,
  DrawerTrigger,
  Filter,
  KeyValueWithButton,
  Slider,
  Table,
  TitleWithInfo,
} from '@webb-dapp/webb-ui-components/components';
import { fuzzyFilter } from '@webb-dapp/webb-ui-components/components/Filter/utils';
import { Authority } from '@webb-dapp/webb-ui-components/components/KeyStatusCard/types';
import { fetchKeygenData } from '@webb-dapp/webb-ui-components/hooks';
import { KeygenType } from '@webb-dapp/webb-ui-components/types';
import { useEffect, useMemo, useState } from 'react';

import { KeyDetail } from '../KeyDetail';

const columnHelper = createColumnHelper<KeygenType>();

const headerConfig = {
  common: {
    titleComponent: 'span' as const,
  },
  height: {
    title: 'Height',
    info: 'Number of blocks',
  },
  session: {
    title: 'Session',
    info: 'A session is a period that has a constant set of validators. Validators can only join or exit the validator set at a session change.',
  },
  key: {
    title: 'Key',
    info: 'The public key of the DKG protocol that is currently active.',
  },
  signatureThreshold: {
    title: 'Signature Threshold',
    info: "The 't' in (t-out-of-n) threshold signatures used in the DKG signing system. Required of DKG authorities to generate signatures.",
  },
  authorities: {
    title: 'Authority Set',
    info: 'A set of DKG authorities',
  },
};

const columns: ColumnDef<KeygenType, any>[] = [
  columnHelper.accessor('height', {
    header: () => <TitleWithInfo {...headerConfig['common']} {...headerConfig['height']} />,
    enableColumnFilter: false,
  }),

  columnHelper.accessor('session', {
    header: () => <TitleWithInfo {...headerConfig['common']} {...headerConfig['session']} />,
    enableColumnFilter: false,
  }),

  columnHelper.accessor('key', {
    header: () => <TitleWithInfo {...headerConfig['common']} {...headerConfig['key']} />,
    cell: (props) => <KeyValueWithButton isHiddenLabel keyValue={props.getValue<string>()} size='sm' />,
    enableColumnFilter: false,
  }),

  columnHelper.accessor('keygenThreshold', {
    header: 'Keygen Threshold',
  }),

  columnHelper.accessor('signatureThreshold', {
    header: () => <TitleWithInfo {...headerConfig['common']} {...headerConfig['signatureThreshold']} />,
  }),

  columnHelper.accessor('authorities', {
    header: () => <TitleWithInfo {...headerConfig['common']} {...headerConfig['authorities']} />,
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
    cell: () => (
      <Drawer>
        <DrawerTrigger>
          <Button className='uppercase' varirant='link' as='span' size='sm'>
            Details
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <KeyDetail />
        </DrawerContent>
      </Drawer>
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
      leftTitle={
        <Filter
          clearAllFilters={() => {
            table.setColumnFilters([]);
            table.setGlobalFilter('');
          }}
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
      <Table tableProps={table as RTTable<unknown>} isPaginated />
    </CardTable>
  );
};
