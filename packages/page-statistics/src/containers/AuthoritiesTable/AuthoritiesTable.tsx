import FormControlLabel from '@mui/material/FormControlLabel';
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
  PaginationState,
  Table as RTTable,
  useReactTable,
} from '@tanstack/react-table';
import { AuthorityListItem, PageInfoQuery, useAuthorities } from '@webb-dapp/page-statistics/provider/hooks';
import {
  Avatar,
  Button,
  CardTable,
  CheckBox,
  Collapsible,
  CollapsibleButton,
  CollapsibleContent,
  Filter,
  KeyValueWithButton,
  Progress,
  Slider,
  Table,
} from '@webb-dapp/webb-ui-components/components';
import { fuzzyFilter } from '@webb-dapp/webb-ui-components/components/Filter/utils';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { FC, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { countries } from 'country-flag-icons';
import * as flags from 'country-flag-icons/react/3x2';
import { AuthoritiesTableProps } from './types';

const columnHelper = createColumnHelper<AuthorityListItem>();
const columns: ColumnDef<AuthorityListItem, any>[] = [
  columnHelper.accessor('id', {
    header: 'Participant',
    cell: (props) => (
      <div className='flex items-center space-x-2'>
        <Avatar sourceVariant={'address'} value={props.getValue<string>()} />
        <KeyValueWithButton keyValue={props.getValue<string>()} size='sm' isHiddenLabel />
      </div>
    ),
  }),

  columnHelper.accessor('location', {
    header: 'Location',
    cell: (props) => (
      <Typography variant='h5' fw='bold' component='span' className='!text-inherit'>
        {getUnicodeFlagIcon(props.getValue())}
      </Typography>
    ),
  }),

  columnHelper.accessor('uptime', {
    header: 'Uptime',
    cell: (props) => <Progress size='sm' value={parseInt(props.getValue())} className='w-[100px]' suffixLabel='%' />,
  }),

  columnHelper.accessor('reputation', {
    header: 'Reputation',
    cell: (props) => <Progress size='sm' value={parseInt(props.getValue())} className='w-[100px]' suffixLabel='%' />,
  }),

  columnHelper.accessor('id', {
    header: '',
    id: 'details',
    cell: (props) => (
      <Button variant='link' size='sm'>
        <Link to={`/authorities/drawer/${props.getValue<string>()}`}>Details</Link>
      </Button>
    ),
  }),
];

export const AuthoritiesTable: FC<AuthoritiesTableProps> = ({ data: dataProp }) => {
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
  const query = useMemo<PageInfoQuery>(
    () => ({
      offset: pageIndex * pageSize,
      perPage: pageSize,
      filter: null,
    }),
    [pageIndex, pageSize]
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const authorities = useAuthorities(query);
  const totalItems = useMemo(() => authorities.val?.pageInfo.count ?? 0, [authorities]);
  const pageCount = useMemo(() => Math.ceil(totalItems / pageSize), [pageSize, totalItems]);
  const data = useMemo(() => authorities.val?.items ?? [], [authorities]);
  const table = useReactTable<AuthorityListItem>({
    data: data ?? ([] as AuthorityListItem[]),
    columns,
    pageCount,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination,
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    manualPagination: dataProp === undefined,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const headers = useMemo(
    () => table.getHeaderGroups().map((headerGroup) => headerGroup.headers.map((header) => header)),
    [table]
  );

  const [{ column: keygenFilterCol }, { column: signatureFilterCol }] = useMemo(
    () => headers[0].filter((header) => header.column.getCanFilter()),
    [headers]
  );
  console.log({ authorities });
  return (
    <CardTable
      titleProps={{
        title: 'DKG Authorities',
        info: 'DKG Authorities',
        variant: 'h5',
      }}
      leftTitle={
        <Filter
          searchPlaceholder={'Search  authority account'}
          searchText={globalFilter}
          onSearchChange={(nextValue: string | number) => {
            setGlobalFilter(nextValue.toString());
          }}
          clearAllFilters={() => {
            table.setColumnFilters([]);
            table.setGlobalFilter('');
          }}
        >
          <Collapsible>
            <CollapsibleButton>Keygen Threshold</CollapsibleButton>
            <CollapsibleContent>
              <Slider
                max={keygenFilterCol.getFacetedMinMaxValues()?.[1]}
                defaultValue={keygenFilterCol.getFacetedMinMaxValues()?.map((i) => (i ? 0 : i))}
                value={keygenFilterCol.getFilterValue() as [number, number]}
                onChange={(nextValue) => keygenFilterCol.setFilterValue(nextValue)}
                className='w-full min-w-0'
                hasLabel
              />
            </CollapsibleContent>
          </Collapsible>
          <Collapsible>
            <CollapsibleButton>Location</CollapsibleButton>
            <CollapsibleContent className={`space-x-1 `}>
              <LocationFilter
                countries={countries ?? []}
                onChange={(c) => {
                  console.log(c);
                }}
              />
            </CollapsibleContent>
          </Collapsible>
        </Filter>
      }
    >
      <Table tableProps={table as RTTable<unknown>} isPaginated totalRecords={totalItems} />
    </CardTable>
  );
};

const LocationFilter: FC<{ onChange(country: string): void; countries: string[] }> = ({ countries, onChange }) => {
  return (
    <div style={{ width: '300px' }}>
      {countries.map((country) => {
        // @ts-ignore
        const C = flags[country.toUpperCase() as unknown as any];
        return (
          <FormControlLabel
            className={'min-w-full'}
            key={country}
            value={country}
            label={
              <Typography
                style={{
                  alignItems: 'center',
                }}
                variant='label'
              >
                <C />
                {country}
              </Typography>
            }
            onChange={() => {
              onChange(country);
            }}
            control={<CheckBox color='primary' />}
          />
        );
      })}
    </div>
  );
};
