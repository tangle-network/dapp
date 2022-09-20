import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  Table as RTTable,
  useReactTable,
} from '@tanstack/react-table';
import { SessionKeyStatus, useKey } from '@webb-dapp/page-statistics/provider/hooks';
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
  Progress,
  Table,
  TimeLine,
  TimeLineItem,
  TimeProgress,
  TitleWithInfo,
} from '@webb-dapp/webb-ui-components/components';
import { fuzzyFilter } from '@webb-dapp/webb-ui-components/components/Filter/utils';
import { ArrowLeft, ArrowRight, Close, Expand, Spinner } from '@webb-dapp/webb-ui-components/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import { shortenString } from '@webb-dapp/webb-ui-components/utils';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { forwardRef, useMemo } from 'react';

import { AuthorityRowType, KeyDetailProps } from './types';

const columnHelper = createColumnHelper<AuthorityRowType>();

const columns: ColumnDef<AuthorityRowType, any>[] = [
  columnHelper.accessor('account', {
    header: 'Participant',
    cell: (props) => (
      <Typography variant='body2' component='span' className='!text-inherit'>
        {shortenString(props.getValue(), 10)}
      </Typography>
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

  columnHelper.accessor('detaillUrl', {
    header: '',
    cell: (props) => (
      <Button
        varirant='link'
        href={props.getValue()}
        target='_blank'
        rel='noopener noreferrer'
        size='sm'
        className='uppercase'
      >
        Details
      </Button>
    ),
  }),
];

export const KeyDetail = forwardRef<HTMLDivElement, KeyDetailProps>(({ isPage, keyId }, ref) => {
  const { error, isFailed, isLoading, val: keyDetail } = useKey(keyId);

  const authoritiesTblData = useMemo<AuthorityRowType[]>(() => {
    return keyDetail
      ? keyDetail.authorities.map((aut) => ({ ...aut, detaillUrl: 'https://webb.tools' })) // TODO: Determine the detail url
      : ([] as AuthorityRowType[]);
  }, [keyDetail]);

  const pagination = useMemo(
    () => ({
      pageIndex: 0,
      pageSize: 10,
    }),
    []
  );

  const table = useReactTable<AuthorityRowType>({
    data: authoritiesTblData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination,
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
  });

  if (isLoading) {
    return <Spinner size='xl' />;
  }

  if (isFailed || !keyDetail) {
    return (
      <div>
        <Typography variant='body1' className='text-red-100 dark:text-red-10'>
          {error ?? 'Unexpected error'}
        </Typography>
      </div>
    );
  }

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
            {keyDetail.isCurrent ? 'Current' : 'Next'}
          </Chip>
          <LabelWithValue label='Session: ' value={keyDetail.session} />
        </div>

        {/** Active Period */}
        <div className='flex flex-col space-y-3'>
          <TitleWithInfo title='Active Period' variant='body1' titleComponent='h6' info='Active period' />

          <TimeProgress startTime={keyDetail.start} endTime={keyDetail.end} />
        </div>

        {/** Compressed/Uncompressed Keys */}
        <div className='flex space-x-4'>
          <KeyCard title='Compressed key' keyValue={keyDetail.compressed} />
          <KeyCard title='Uncompressed key' keyValue={keyDetail.uncompressed} />
        </div>
      </div>

      {/** Key history */}
      <div className='flex flex-col p-4 space-y-4'>
        <TitleWithInfo title='Key History' variant='h5' info='Key history' />

        <TimeLine>
          {keyDetail.history.map((hist, idx) => {
            const { at, hash, status } = hist;

            switch (status) {
              case SessionKeyStatus.Generated: {
                return (
                  <TimeLineItem
                    key={`${at.toString()}-${idx}`}
                    title={status}
                    time={at}
                    txHash={hash}
                    externalUrl='https://webb.tools' // TODO: Determine the external url
                  />
                );
              }

              case SessionKeyStatus.Signed: {
                return (
                  <TimeLineItem
                    key={`${at.toString()}-${idx}`}
                    title={status}
                    time={at}
                    txHash={hash}
                    externalUrl='https://webb.tools' // TODO: Determine the external url
                    extraContent={
                      <div className='flex items-center space-x-2'>
                        <KeyValueWithButton keyValue={keyDetail.uncompressed} size='sm' />
                        <Button varirant='link' size='sm' className='uppercase'>
                          Detail
                        </Button>
                      </div>
                    }
                  />
                );
              }

              case SessionKeyStatus.Rotated: {
                return (
                  <TimeLineItem
                    key={`${at.toString()}-${idx}`}
                    title={status}
                    time={at}
                    txHash={hash}
                    externalUrl='https://webb.tools'
                    extraContent={
                      <div className='flex items-center space-x-4'>
                        <LabelWithValue label='Height' value={keyDetail.height} />
                        {/** TODO: Proposal type */}
                        <LabelWithValue label='Proposal' value='KeyRotation' />
                        <LabelWithValue
                          label='Proposers'
                          value={
                            <AvatarGroup total={keyDetail.authorities.length}>
                              {Object.values(keyDetail.authorities).map((author) => (
                                <Avatar key={author.id} value={author.account} />
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
                );
              }

              default: {
                throw new Error('Unknown SessionKeyStatus in KeyDetail component');
              }
            }
          })}
        </TimeLine>
      </div>

      {/** Stats */}
      <div className='flex space-x-4'>
        <div className='flex flex-col items-center justify-center py-3 space-y-1 rounded-lg grow bg-mono-20 dark:bg-mono-160'>
          <Typography variant='h4' fw='bold' className='block'>
            {keyDetail.keyGenThreshold}
          </Typography>
          <Typography variant='body1' fw='bold' className='block'>
            Threshold
          </Typography>
        </div>

        <div className='flex flex-col items-center justify-center py-3 space-y-1 rounded-lg grow bg-mono-20 dark:bg-mono-160'>
          <Typography variant='h4' fw='bold' className='block'>
            {keyDetail.numberOfValidators}
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
