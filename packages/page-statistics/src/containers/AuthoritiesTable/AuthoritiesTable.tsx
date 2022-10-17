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
import { useCountriesQuery } from '@webb-dapp/page-statistics/generated/graphql';
import { AuthorisesQuery, AuthorityListItem, Range, useAuthorities } from '@webb-dapp/page-statistics/provider/hooks';
import {
  Avatar,
  Button,
  CardTable,
  Collapsible,
  CollapsibleButton,
  CollapsibleContent,
  Filter,
  KeyValueWithButton,
  Progress,
  Slider,
  Table,
} from '@webb-dapp/webb-ui-components/components';
import { CheckBoxMenu } from '@webb-dapp/webb-ui-components/components/CheckBoxMenu';
import { fuzzyFilter } from '@webb-dapp/webb-ui-components/components/Filter/utils';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import * as flags from 'country-flag-icons/react/3x2';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { FC, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { AuthoritiesTableProps } from './types';

const columnHelper = createColumnHelper<AuthorityListItem>();
const columns: ColumnDef<AuthorityListItem, any>[] = [
  columnHelper.accessor('id', {
    header: 'Participant',
    enableColumnFilter: false,
    cell: (props) => (
      <div className='flex items-center space-x-2'>
        <Avatar sourceVariant={'address'} value={props.getValue<string>()} />
        <KeyValueWithButton keyValue={props.getValue<string>()} size='sm' isHiddenLabel />
      </div>
    ),
  }),

  columnHelper.accessor('location', {
    header: 'Location',
    enableColumnFilter: true,
    cell: (props) => (
      <Typography variant='h5' fw='bold' component='span' className='!text-inherit'>
        {getUnicodeFlagIcon(props.getValue())}
      </Typography>
    ),
  }),

  columnHelper.accessor('uptime', {
    header: 'Uptime',
    enableColumnFilter: true,
    cell: (props) => <Progress size='sm' value={parseInt(props.getValue())} className='w-[100px]' suffixLabel='%' />,
  }),

  columnHelper.accessor('reputation', {
    header: 'Reputation',
    enableColumnFilter: true,
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

  const [selectedCountries, setSelectedCountries] = useState<'all' | string[]>('all');
  const countriesQuery = useCountriesQuery();
  const countries = useMemo(() => {
    return (
      countriesQuery.data?.countryCodes?.nodes?.map((country) => {
        return country?.code!;
      }) ?? []
    );
  }, [countriesQuery]);

  const [uptimeFilter, setUptimeFilter] = useState<[number, number]>([0, 100]);
  const [reputationFilter, setReputationFilter] = useState<[number, number]>([0, 100]);

  const query = useMemo<AuthorisesQuery>(
    () => ({
      offset: pageIndex * pageSize,
      perPage: pageSize,
      filter: {
        uptime: uptimeFilter,
        reputation: reputationFilter,
        countries: [],
      },
    }),
    [pageIndex, pageSize, uptimeFilter, reputationFilter]
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
            <CollapsibleButton>Location</CollapsibleButton>
            <CollapsibleContent className={`space-x-1 `}>
              <LocationFilter
                selected={selectedCountries}
                countries={countries}
                onChange={(c) => {
                  setSelectedCountries(c);
                }}
              />
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleButton>Uptime</CollapsibleButton>
            <CollapsibleContent>
              <Slider
                max={100}
                defaultValue={[0, 100]}
                value={uptimeFilter}
                onChange={(val) => setUptimeFilter(val as any)}
                className='w-full min-w-0'
                hasLabel
              />
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleButton>Reputation</CollapsibleButton>
            <CollapsibleContent>
              <Slider
                max={100}
                defaultValue={[0, 100]}
                value={reputationFilter}
                onChange={(val) => setReputationFilter(val as any)}
                className='w-full min-w-0'
                hasLabel
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

const LocationFilter: FC<{
  selected: 'all' | string[];
  onChange(nextValue: 'all' | string[]): void;
  countries: string[];
}> = ({ countries, onChange, selected }) => {
  const isAllSelected = useMemo(() => {
    if (selected === 'all' || (Array.isArray(selected) && selected.length === countries.length)) {
      return true;
    }
    return false;
  }, [selected, countries]);

  return (
    <div
      style={{
        maxWidth: '300px',
        maxHeight: 300,
        overflow: 'hidden',
        overflowY: 'auto',
      }}
    >
      <CheckBoxMenu
        checkboxProps={{
          isChecked: isAllSelected,
        }}
        label={'all'}
        onChange={() => {
          onChange(isAllSelected ? [] : 'all');
        }}
      />
      {countries.map((country) => {
        // @ts-ignore
        const C = flags[country.toUpperCase() as unknown as any];
        return (
          <CheckBoxMenu
            checkboxProps={{
              isChecked: isAllSelected ? true : selected.indexOf(country) > -1,
            }}
            onChange={() => {
              const isSelected = selected.indexOf(country) > -1;
              // IF all the countries are selected
              if (isAllSelected) {
                onChange(countries.filter((c) => c !== country));
              } else if (Array.isArray(selected)) {
                if (isSelected) {
                  onChange(selected.filter((c) => c !== country));
                } else {
                  onChange([...selected, country]);
                }
              }
            }}
            icon={<C className={'w-6'} />}
            label={country}
          />
        );
      })}
    </div>
  );
};
