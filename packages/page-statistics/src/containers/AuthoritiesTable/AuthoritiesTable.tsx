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
import { KeyGenAuthority } from '@webb-dapp/page-statistics/provider/hooks';
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
import { randAccount32, shortenString } from '@webb-dapp/webb-ui-components/utils';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { FC, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { AuthoritiesTableProps } from './types';

const columnHelper = createColumnHelper<KeyGenAuthority>();

const columns: ColumnDef<KeyGenAuthority, any>[] = [
  columnHelper.accessor('account', {
    header: 'Participant',
    cell: (props) => (
      <div className='flex items-center space-x-2'>
        <Avatar value={props.getValue<string>()} />
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
  const [data, setData] = useState(dataProp);

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { fetchData } = useSeedData(getNewAuthority);

  const [dataQuery, setDataQuery] = useState<Awaited<ReturnType<typeof fetchData>> | undefined>();

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const pageCount = useMemo(() => {
    if (dataProp !== undefined) {
      return Math.ceil(dataProp.length / pageSize);
    }

    return dataQuery?.pageCount ?? 0;
  }, [dataProp, dataQuery, pageSize]);

  const totalItems = useMemo(() => {
    if (dataProp !== undefined) {
      return dataProp.length;
    }

    return dataQuery?.totalItems ?? 0;
  }, [dataProp, dataQuery?.totalItems]);

  useEffect(() => {
    const updateData = async () => {
      if (dataProp !== undefined) {
        return;
      }

      const fetchedData = await fetchData(pagination);
      setDataQuery(fetchedData);
      setData(fetchedData.rows);
    };

    updateData();
  }, [dataProp, fetchData, pagination]);

  const table = useReactTable<KeyGenAuthority>({
    data: data ?? ([] as KeyGenAuthority[]),
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
