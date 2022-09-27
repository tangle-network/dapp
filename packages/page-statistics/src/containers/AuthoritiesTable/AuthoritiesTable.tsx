import { randCountryCode, randEthereumAddress, randNumber } from '@ngneat/falso';
import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  Table as RTTable,
  useReactTable,
} from '@tanstack/react-table';
import {
  AuthorityListItem,
  KeyGenAuthority,
  PageInfoQuery,
  useAuthorities,
} from '@webb-dapp/page-statistics/provider/hooks';
import {
  Avatar,
  Button,
  CardTable,
  KeyValueWithButton,
  Progress,
  Table,
} from '@webb-dapp/webb-ui-components/components';
import { fuzzyFilter } from '@webb-dapp/webb-ui-components/components/Filter/utils';
import { useSeedData } from '@webb-dapp/webb-ui-components/hooks';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import { randAccount32 } from '@webb-dapp/webb-ui-components/utils';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { FC, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

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
    cell: (props) => (
      <Button varirant='link' size='sm' className='uppercase'>
        <Link to={`/authorities/drawer/${props.getValue<string>()}`}>Details</Link>
      </Button>
    ),
  }),
];

const getNewAuthority = (): KeyGenAuthority => ({
  id: randEthereumAddress() + randEthereumAddress().substring(2),
  account: randAccount32(),
  location: randCountryCode(),
  uptime: randNumber({ min: 90, max: 100 }),
  reputation: randNumber({ min: 90, max: 100 }),
});

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
    onPaginationChange: setPagination,
    manualPagination: dataProp === undefined,
  });

  return (
    <CardTable
      titleProps={{
        title: 'DKG Authorities',
        info: 'DKG Authorities',
        variant: 'h5',
      }}
    >
      <Table tableProps={table as RTTable<unknown>} isPaginated totalRecords={totalItems} />
    </CardTable>
  );
};
