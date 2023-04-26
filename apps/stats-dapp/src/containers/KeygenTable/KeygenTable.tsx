import {
  Column,
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
  PageInfoQuery,
  useKeys,
  PublicKey,
  useActiveKeys,
} from '../../provider/hooks';
import {
  Accordion,
  AccordionButton,
  AccordionContent,
  AccordionItem,
  Avatar,
  AvatarGroup,
  Button,
  CardTable,
  Filter,
  KeyValueWithButton,
  Slider,
  Table,
  TitleWithInfo,
  Divider,
} from '@webb-tools/webb-ui-components/components';
import { fuzzyFilter } from '@webb-tools/webb-ui-components/components/Filter/utils';
import { KeygenType } from '@webb-tools/webb-ui-components/types';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from '@webb-tools/icons';

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
  keygenThreshold: {
    title: 'Keygen Threshold',
    info: 'Minimum number of signers needed in order to produce a valid signature.',
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
    header: () => (
      <TitleWithInfo
        {...headerConfig['common']}
        {...headerConfig['height']}
        className="justify-center"
      />
    ),
    enableColumnFilter: false,
  }),

  columnHelper.accessor('session', {
    header: () => (
      <TitleWithInfo
        {...headerConfig['common']}
        {...headerConfig['session']}
        className="justify-center"
      />
    ),
    enableColumnFilter: false,
  }),

  columnHelper.accessor('key', {
    header: () => (
      <TitleWithInfo
        {...headerConfig['common']}
        {...headerConfig['key']}
        className="justify-center"
      />
    ),
    cell: (props) => (
      <KeyValueWithButton
        isHiddenLabel
        keyValue={props.getValue<string>()}
        size="sm"
        className="flex justify-center"
      />
    ),
    enableColumnFilter: false,
  }),

  columnHelper.accessor('keygenThreshold', {
    header: () => (
      <TitleWithInfo
        {...headerConfig['common']}
        {...headerConfig['keygenThreshold']}
        className="justify-center"
      />
    ),
  }),

  columnHelper.accessor('signatureThreshold', {
    header: () => (
      <TitleWithInfo
        {...headerConfig['common']}
        {...headerConfig['signatureThreshold']}
        className="justify-center"
      />
    ),
  }),

  columnHelper.accessor('authorities', {
    header: () => (
      <TitleWithInfo
        {...headerConfig['common']}
        {...headerConfig['authorities']}
        className="justify-center"
      />
    ),
    cell: (props) => {
      const auth = Array.from(props.getValue<Set<string>>());
      if (auth.length === 0) {
        return '-';
      }
      return (
        <AvatarGroup
          total={props.row.original.totalAuthorities}
          className="flex justify-center"
        >
          {auth.map((au, idx) => (
            <Avatar sourceVariant={'address'} key={`${au}${idx}`} value={au} />
          ))}
        </AvatarGroup>
      );
    },
    enableColumnFilter: false,
  }),

  columnHelper.accessor('keyId', {
    header: '',
    cell: (props) => (
      <Link to={`drawer/${props.getValue()}`}>
        <Button variant="link" as="span" size="sm">
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

  const { error, isFailed, isLoading, val: activeKeyData } = useActiveKeys();

  const { currentKey } = useMemo<{
    currentKey: PublicKey | null | undefined;
  }>(() => {
    return {
      currentKey: activeKeyData ? activeKeyData[0] : null,
    };
  }, [activeKeyData]);

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

  const pageCount = useMemo(
    () => Math.ceil(totalItems / pageSize),
    [pageSize, totalItems]
  );

  const keysStats = useKeys(pageQuery, currentKey);

  const data = useMemo(() => {
    if (keysStats.val) {
      return keysStats.val.items
        .filter((v) => {
          return v.keyGenThreshold && v.signatureThreshold;
        })
        .map(
          (item): KeygenType => ({
            height: Number(item.height),
            session: Number(item.session),
            key: item.compressed,
            authorities: new Set(item.keyGenAuthorities),
            keygenThreshold: item.keyGenThreshold ?? 0,
            keyId: item.uncompressed,
            totalAuthorities: item.keyGenAuthorities.length,
            signatureThreshold: item.signatureThreshold ?? 0,
            previousKeyId: item.previousKeyId,
            nextKeyId: item.nextKeyId,
          })
        );
    }
    return [] as KeygenType[];
  }, [keysStats, totalItems]);

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
    () =>
      table
        .getHeaderGroups()
        .map((headerGroup) => headerGroup.headers.map((header) => header)),
    [table]
  );

  const [{ column: keygenFilterCol }, { column: signatureFilterCol }] = useMemo(
    () => headers[0].filter((header) => header.column.getCanFilter()),
    [headers]
  );

  const getSliderDefaultValue = useCallback(
    (column: Column<KeygenType, unknown>) =>
      column.getFacetedMinMaxValues()?.[0] ===
      column.getFacetedMinMaxValues()?.[1]
        ? [
            column.getFacetedMinMaxValues()?.[0] ?? 0,
            column.getFacetedMinMaxValues()?.[1] ?? 0,
          ]
        : column.getFacetedMinMaxValues() ?? [0, 0],
    []
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
          <Accordion type={'single'} collapsible>
            <AccordionItem className={'p-0 py-0'} value={'keygenThreshold'}>
              <AccordionButton>Keygen Threshold</AccordionButton>
              <Divider className="bg-mono-40 dark:bg-mono-140" />
              <AccordionContent>
                <Slider
                  max={keygenFilterCol.getFacetedMinMaxValues()?.[1]}
                  defaultValue={getSliderDefaultValue(keygenFilterCol)}
                  value={keygenFilterCol.getFilterValue() as [number, number]}
                  onChange={(nextValue) =>
                    keygenFilterCol.setFilterValue(nextValue)
                  }
                  className="w-full min-w-0"
                  hasLabel
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem className={'p-0 py-0'} value={'signatureThresholds'}>
              <AccordionButton>Signature Threshold</AccordionButton>
              <AccordionContent>
                <Slider
                  max={signatureFilterCol.getFacetedMinMaxValues()?.[1]}
                  defaultValue={getSliderDefaultValue(signatureFilterCol)}
                  value={
                    signatureFilterCol.getFilterValue() as [number, number]
                  }
                  onChange={(nextValue) =>
                    signatureFilterCol.setFilterValue(nextValue)
                  }
                  className="w-full min-w-0"
                  hasLabel
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Filter>
      }
    >
      {totalItems <= 0 ? (
        <div className="flex items-center justify-center min-w-full min-h-[700px]">
          <Spinner size="xl" />
        </div>
      ) : (
        <Table
          tableProps={table as RTTable<unknown>}
          totalRecords={totalItems}
          isPaginated
          tdClassName="text-center"
          title="Keys"
        />
      )}
    </CardTable>
  );
};
