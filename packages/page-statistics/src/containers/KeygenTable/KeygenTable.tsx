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
import { PageInfoQuery, useKeys } from '@webb-dapp/page-statistics/provider/hooks';
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
  TitleWithInfo,
} from '@webb-dapp/webb-ui-components/components';
import { fuzzyFilter } from '@webb-dapp/webb-ui-components/components/Filter/utils';
import { KeygenType } from '@webb-dapp/webb-ui-components/types';
import { FC, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const columnHelper = createColumnHelper<KeygenType>();

export const headerConfig = {
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
        {Array.from(props.getValue<Set<string>>()).map((au, idx) => (
          <Avatar key={`${au}${idx}`} value={au} />
        ))}
      </AvatarGroup>
    ),
    enableColumnFilter: false,
  }),

  columnHelper.accessor('keyId', {
    header: '',
    cell: (props) => (
      <Link to={`drawer/${props.getValue()}`}>
        <Button className='uppercase' varirant='link' as='span' size='sm'>
          Details
        </Button>
      </Link>
    ),
    enableColumnFilter: false,
  }),
];

export const KeygenTable: FC = () => {
  // Filters
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Pagination state
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalItems, setTotalItems] = useState(0);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const pageQuery: PageInfoQuery = useMemo(
    () => ({
      offset: pagination.pageIndex * pageSize,
      perPage: pagination.pageSize,
      filter: null,
    }),
    [pageSize, pagination.pageIndex, pagination.pageSize]
  );

  const pageCount = useMemo(() => Math.floor(totalItems / pageSize), [pageSize, totalItems]);

  const keysStats = useKeys(pageQuery);

  const data = useMemo(() => {
    if (keysStats.val) {
      return keysStats.val.items.map(
        (item): KeygenType => ({
          height: Number(item.height),
          session: Number(item.session),
          key: item.uncompressed,
          authorities: new Set(item.keyGenAuthorities),
          keygenThreshold: Number(item.keyGenThreshold),
          keyId: item.uncompressed,
          totalAuthorities: item.keyGenAuthorities.length,
          signatureThreshold: Number(item.signatureThreshold),
          previousKeyId: item.previousKeyId,
          nextKeyId: item.nextKeyId,
        })
      );
    }
    return [] as KeygenType[];
  }, [keysStats]);

  useEffect(() => {
    if (keysStats.val) {
      setTotalItems(keysStats.val.pageInfo.count);
    }
  }, [keysStats]);

  const table = useReactTable<KeygenType>({
    data,
    columns,
    pageCount,
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
      titleProps={{
        title: 'List of Keygens',
        info: 'List of Keygens',
        variant: 'h5',
      }}
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
      <Table tableProps={table as RTTable<unknown>} totalRecords={totalItems} isPaginated />
    </CardTable>
  );
};
