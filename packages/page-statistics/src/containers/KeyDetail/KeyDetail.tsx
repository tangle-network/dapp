import { randEthereumAddress, randNumber, randRecentDate, randSoonDate } from '@ngneat/falso';
import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  PaginationState,
  Table as RTTable,
  useReactTable,
} from '@tanstack/react-table';
import { fetchAuthoritiesData } from '@webb-dapp/page-statistics/hooks';
import {
  Avatar,
  AvatarGroup,
  Button,
  CardTable,
  Chip,
  DrawerCloseButton,
  KeyCard,
  KeyValueWithButton,
  LabelWithValue,
  Table,
  TimeLine,
  TimeLineItem,
  TimeProgress,
  TitleWithInfo,
} from '@webb-dapp/webb-ui-components/components';
import { fuzzyFilter } from '@webb-dapp/webb-ui-components/components/Filter/utils';
import { useKeygenSeedData } from '@webb-dapp/webb-ui-components/hooks';
import { ArrowLeft, ArrowRight, Close, Expand } from '@webb-dapp/webb-ui-components/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import { forwardRef, useEffect, useMemo, useState } from 'react';

import { AuthorityRowType, KeyDetailProps } from './types';

const columnHelper = createColumnHelper<AuthorityRowType>();

const columns: ColumnDef<AuthorityRowType, any>[] = [
  columnHelper.accessor('id', {
    header: 'Participant',
  }),

  columnHelper.accessor('location', {
    header: 'Location',
  }),

  columnHelper.accessor('uptime', {
    header: 'Uptime',
  }),

  columnHelper.accessor('reputation', {
    header: 'Reputation',
  }),

  columnHelper.accessor('detaillUrl', {
    header: '',
  }),
];

export const KeyDetail = forwardRef<HTMLDivElement, KeyDetailProps>(({ isPage, ...props }, ref) => {
  const [keygen] = useKeygenSeedData();

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

  const [dataQuery, setDataQuery] = useState<undefined | Awaited<ReturnType<typeof fetchAuthoritiesData>>>();

  useEffect(() => {
    const updateData = async () => {
      const dataQuery = await fetchAuthoritiesData({ pageIndex, pageSize });

      setDataQuery(dataQuery);
    };

    updateData();
  }, [pageIndex, pageSize]);

  const table = useReactTable<AuthorityRowType>({
    data: dataQuery?.rows ?? ([] as AuthorityRowType[]),
    columns,
    pageCount: dataQuery?.pageCount ?? -1,
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    manualPagination: true,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
  });

  return (
    <div className='flex flex-col p-6 space-y-4' ref={ref}>
      {/** Key detail */}
      <div className='flex flex-col p-4 space-y-4'>
        {/** Title */}
        <div className='flex items-center justify-between'>
          {/** Title with info and expand button */}
          <div className='flex items-center space-x-3'>
            {isPage ? <ArrowLeft size='lg' /> : <Expand size='lg' />}
            <TitleWithInfo title='Key Details' variant='h4' info='Key Details' />
          </div>

          {/** Right buttons */}
          <div>
            <div className='flex items-center space-x-4'>
              {/** Previous/Next Buttons */}
              <div className='flex space-x-2'>
                <Button
                  size='sm'
                  leftIcon={<ArrowLeft className='!fill-current' />}
                  varirant='utility'
                  className='uppercase'
                >
                  Prev Key
                </Button>
                <Button
                  size='sm'
                  rightIcon={<ArrowRight className='!fill-current' />}
                  varirant='utility'
                  className='uppercase'
                >
                  Next Key
                </Button>
              </div>

              {/** Close modal */}
              {!isPage && (
                <DrawerCloseButton>
                  <Close size='lg' />
                </DrawerCloseButton>
              )}
            </div>
          </div>
        </div>

        {/** Session number */}
        <div className='flex items-center space-x-2'>
          <Chip color='green' className='uppercase'>
            Next
          </Chip>
          <LabelWithValue label='Session: ' value={3456} />
        </div>

        {/** Active Period */}
        <div className='flex flex-col space-y-3'>
          <TitleWithInfo title='Active Period' variant='body1' titleComponent='h6' info='Active period' />

          <TimeProgress startTime={randRecentDate()} endTime={randSoonDate()} />
        </div>

        {/** Compressed/Uncompressed Keys */}
        <div className='flex space-x-4'>
          <KeyCard title='Compressed key' keyValue={randEthereumAddress()} />
          <KeyCard title='Uncompressed key' keyValue={randEthereumAddress() + randEthereumAddress().substring(2)} />
        </div>
      </div>

      {/** Key history */}
      <div className='flex flex-col p-4 space-y-4'>
        <TitleWithInfo title='Key History' variant='h5' info='Key history' />

        <TimeLine>
          <TimeLineItem
            title='Generated'
            time={randRecentDate()}
            txHash={randEthereumAddress()}
            externalUrl='https://webb.tools'
          />

          <TimeLineItem
            title='Signed'
            time={randRecentDate()}
            txHash={randEthereumAddress()}
            externalUrl='https://webb.tools'
            extraContent={
              <div className='flex items-center space-x-2'>
                <KeyValueWithButton keyValue={randEthereumAddress()} size='sm' />
                <Button varirant='link' size='sm' className='uppercase'>
                  Detail
                </Button>
              </div>
            }
          />

          <TimeLineItem
            title='Key Rotated'
            time={randRecentDate()}
            txHash={randEthereumAddress()}
            externalUrl='https://webb.tools'
            extraContent={
              <div className='flex items-center space-x-4'>
                <LabelWithValue label='Height' value={1000654} />
                <LabelWithValue label='Proposal' value='KeyRotation' />
                <LabelWithValue
                  label='Proposers'
                  value={
                    <AvatarGroup total={randNumber({ min: 10, max: 20 })}>
                      {Object.values(keygen.authorities).map((au) => (
                        <Avatar key={au.id} src={au.avatarUrl} alt={au.id} />
                      ))}
                    </AvatarGroup>
                  }
                />
                <Button size='sm' varirant='link' className='uppercase'>
                  Details
                </Button>
              </div>
            }
          />
        </TimeLine>
      </div>

      {/** Stats */}
      <div className='flex space-x-4'>
        <div className='flex flex-col items-center justify-center py-3 space-y-1 rounded-lg grow bg-mono-20 dark:bg-mono-160'>
          <Typography variant='h4' fw='bold' className='block'>
            42
          </Typography>
          <Typography variant='body1' fw='bold' className='block'>
            Threshold
          </Typography>
        </div>

        <div className='flex flex-col items-center justify-center py-3 space-y-1 rounded-lg grow bg-mono-20 dark:bg-mono-160'>
          <Typography variant='h4' fw='bold' className='block'>
            102
          </Typography>
          <Typography variant='body1' fw='bold' className='block'>
            Validator
          </Typography>
        </div>
      </div>

      {/** Authorities Table */}
      <CardTable
        titleProps={{
          title: 'DKG Authorities',
          info: 'DKG Authorities',
          variant: 'h5',
        }}
      >
        <Table tableProps={table as RTTable<unknown>} isPaginated />
      </CardTable>
    </div>
  );
});
