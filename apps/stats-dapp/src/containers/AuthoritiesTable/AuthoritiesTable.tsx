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
import { useCountriesQuery } from '../../generated/graphql';
import {
  AuthorityListItem,
  AuthorisesQuery,
  Range,
  useAuthorities,
} from '../../provider/hooks';
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
} from '@webb-tools/webb-ui-components/components';
import { fuzzyFilter } from '@webb-tools/webb-ui-components/components/Filter/utils';
import { CheckBoxMenu } from '@webb-tools/webb-ui-components/components/CheckBoxMenu';
import { CheckBoxMenuGroup } from '@webb-tools/webb-ui-components/components/CheckBoxMenu/CheckBoxMenuGroup';
import { Typography } from '@webb-tools/webb-ui-components';
import * as flags from 'country-flag-icons/react/3x2';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { FC, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { AuthoritiesTableProps } from './types';
const countries = ['eg', 'uk'];

const columnHelper = createColumnHelper<AuthorityListItem>();

const columns: ColumnDef<AuthorityListItem, any>[] = [
  columnHelper.accessor('id', {
    header: 'Participant',
    enableColumnFilter: false,
    cell: (props) => (
      <div className="flex items-center space-x-2">
        <Avatar sourceVariant={'address'} value={props.getValue<string>()} />
        <KeyValueWithButton
          keyValue={props.getValue<string>()}
          size="sm"
          isHiddenLabel
        />
      </div>
    ),
  }),

  columnHelper.accessor('location', {
    header: 'Location',
    enableColumnFilter: false,
    cell: (props) => (
      <Typography
        variant="h5"
        fw="bold"
        component="span"
        className="!text-inherit"
      >
        {getUnicodeFlagIcon(props.getValue())}
      </Typography>
    ),
  }),

  columnHelper.accessor('uptime', {
    header: 'Uptime',
    enableColumnFilter: false,
    cell: (props) => (
      <Progress
        size="sm"
        value={parseInt(props.getValue())}
        className="w-[100px]"
        suffixLabel="%"
      />
    ),
  }),

  columnHelper.accessor('reputation', {
    header: 'Reputation',
    enableColumnFilter: false,
    cell: (props) => (
      <Progress
        size="sm"
        value={parseInt(props.getValue())}
        className="w-[100px]"
        suffixLabel="%"
      />
    ),
  }),

  columnHelper.accessor('id', {
    header: '',
    id: 'details',
    cell: (props) => (
      <Button variant="link" size="sm">
        <Link to={`/authorities/drawer/${props.getValue<string>()}`}>
          Details
        </Link>
      </Button>
    ),
  }),
];

export const AuthoritiesTable: FC<AuthoritiesTableProps> = ({
  data: dataProp,
}) => {
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

  const [selectedCountries, setSelectedCountries] = useState<'all' | string[]>(
    'all'
  );
  const countriesQuery = useCountriesQuery();
  const countries = useMemo(() => {
    return (
      countriesQuery.data?.countryCodes?.nodes?.map((country) => {
        return country?.code;
      }) ?? []
    );
  }, [countriesQuery]);

  const [uptimeFilter, setUptimeFilter] = useState<[number, number]>([0, 100]);
  const [reputationFilter, setReputationFilter] = useState<[number, number]>([
    0, 100,
  ]);
  const [globalFilter, setGlobalFilter] = useState('');

  const query = useMemo<AuthorisesQuery>(
    () => ({
      offset: pageIndex * pageSize,
      perPage: pageSize,
      filter: {
        uptime: uptimeFilter,
        reputation: reputationFilter,
        countries: selectedCountries === 'all' ? countries : selectedCountries,
        search: globalFilter,
      },
    }),
    [
      pageIndex,
      pageSize,
      uptimeFilter,
      reputationFilter,
      selectedCountries,
      countries,
      globalFilter,
    ]
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const authorities = useAuthorities(query);
  const totalItems = useMemo(
    () => authorities.val?.pageInfo.count ?? 0,
    [authorities]
  );
  const pageCount = useMemo(
    () => Math.ceil(totalItems / pageSize),
    [pageSize, totalItems]
  );
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
                className="w-full min-w-0"
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
                className="w-full min-w-0"
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
        totalRecords={totalItems}
      />
    </CardTable>
  );
};

const LocationFilter: FC<{
  selected: 'all' | string[];
  onChange(nextValue: 'all' | string[]): void;
  countries: string[];
}> = ({ countries, onChange, selected }) => {
  return (
    <div
      style={{
        maxWidth: '300px',
        maxHeight: 300,
        overflow: 'hidden',
        overflowY: 'auto',
      }}
    >
      <CheckBoxMenuGroup
        value={selected}
        options={countries}
        onChange={(v) => {
          onChange(v);
        }}
        iconGetter={(c) => {
          return flags[c.toUpperCase() as unknown as any];
        }}
        labelGetter={(c) => c}
        keyGetter={(c) => c}
      />
    </div>
  );
};
