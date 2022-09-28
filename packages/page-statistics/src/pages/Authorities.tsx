import { randBoolean, randEthereumAddress, randNumber, randRecentDate, randSoonDate } from '@ngneat/falso';
import { ColumnDef, createColumnHelper, getCoreRowModel, Table as RTTable, useReactTable } from '@tanstack/react-table';
import {
  Avatar,
  AvatarGroup,
  Button,
  Card,
  CardTable,
  Chip,
  KeyValueWithButton,
  LabelWithValue,
  Stats,
  Table,
  TimeProgress,
  TitleWithInfo,
} from '@webb-dapp/webb-ui-components/components';
import { fuzzyFilter } from '@webb-dapp/webb-ui-components/components/Filter/utils';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import { arrayFrom, randAccount32 } from '@webb-dapp/webb-ui-components/utils';
import { ComponentProps, useMemo } from 'react';
import { Link, Outlet } from 'react-router-dom';

import { AuthoritiesTable } from '../containers';
import { Thresholds, UpcomingThreshold, UpcomingThresholds } from '../provider/hooks';
import { getChipColorByKeyType } from '../utils';

const getNewThresholds = (): [Thresholds, UpcomingThresholds] => {
  const thresholds: Thresholds = {
    keyGen: randNumber({ min: 10, max: 20 }).toString(),
    signature: randNumber({ min: 10, max: 20 }).toString(),
    proposer: randAccount32(),
    publicKey: {
      isCurrent: randBoolean(),
      keyGenAuthorities: arrayFrom(randNumber({ min: 5, max: 10 }), () => randAccount32()),
      id: randEthereumAddress(),
      compressed: randEthereumAddress(),
      uncompressed: randEthereumAddress + randEthereumAddress().substring(2),
      start: randRecentDate(),
      end: randSoonDate(),
      session: randNumber({ min: 2, max: 50 }).toString(),
    },
  };

  const upcomingThreshold: UpcomingThresholds = {
    pending: {
      stats: 'Pending',
      session: randNumber({ min: 2, max: 50 }).toString(),
      keyGen: randNumber({ min: 10, max: 20 }).toString(),
      signature: randNumber({ min: 10, max: 20 }).toString(),
      proposer: randAccount32(),
      // TODO use the type `DiscreteList`
      authoritySet: arrayFrom(randNumber({ min: 5, max: 10 }), () => randAccount32()),
    },

    current: {
      stats: 'Current',
      session: randNumber({ min: 2, max: 50 }).toString(),
      keyGen: randNumber({ min: 10, max: 20 }).toString(),
      signature: randNumber({ min: 10, max: 20 }).toString(),
      proposer: randAccount32(),
      // TODO use the type `DiscreteList`
      authoritySet: arrayFrom(randNumber({ min: 5, max: 10 }), () => randAccount32()),
    },

    next: {
      stats: 'Next',
      session: randNumber({ min: 2, max: 50 }).toString(),
      keyGen: randNumber({ min: 10, max: 20 }).toString(),
      signature: randNumber({ min: 10, max: 20 }).toString(),
      proposer: randAccount32(),
      // TODO use the type `DiscreteList`
      authoritySet: arrayFrom(randNumber({ min: 5, max: 10 }), () => randAccount32()),
    },
  };

  return [thresholds, upcomingThreshold];
};

const columnHelper = createColumnHelper<UpcomingThreshold>();

const columns: ColumnDef<UpcomingThreshold, any>[] = [
  columnHelper.accessor('stats', {
    header: () => (
      <Typography variant='body4' fw='bold' className='!text-inherit'>
        Status
      </Typography>
    ),
    cell: (props) => <Chip color={getChipColorByKeyType(props.getValue())}>{props.getValue<string>()}</Chip>,
  }),

  columnHelper.accessor('session', {
    header: () => (
      <Typography variant='body4' fw='bold' className='!text-inherit'>
        Session
      </Typography>
    ),
  }),

  columnHelper.accessor('keyGen', {
    header: () => (
      <Typography variant='body4' fw='bold' className='!text-inherit'>
        Keygen
      </Typography>
    ),
  }),

  columnHelper.accessor('signature', {
    header: () => (
      <Typography variant='body4' fw='bold' className='!text-inherit'>
        Signature
      </Typography>
    ),
  }),

  columnHelper.accessor('authoritySet', {
    header: () => (
      <Typography variant='body4' fw='bold' className='!text-inherit !text-right'>
        Authority Set
      </Typography>
    ),

    cell: (props) => {
      return (
        <AvatarGroup total={props.getValue<string[]>().length} className='justify-end'>
          {props.getValue<string[]>().map((aut, idx) => (
            <Avatar key={`${aut}-${idx}`} value={aut} />
          ))}
        </AvatarGroup>
      );
    },
  }),
];

const Authorities = () => {
  const [{ keyGen, publicKey, signature }, upComingThresholds] = useMemo(() => getNewThresholds(), []);

  const statsItems = useMemo<ComponentProps<typeof Stats>['items']>(
    () => [
      {
        titleProps: {
          title: 'Keygen',
          info: 'Keygen',
        },
        value: keyGen,
      },
      {
        titleProps: {
          title: 'Signature',
          info: 'Signature',
        },
        value: signature,
      },
    ],
    [keyGen, signature]
  );

  const data = useMemo(() => Object.values(upComingThresholds), [upComingThresholds]);

  const table = useReactTable<UpcomingThreshold>({
    columns: columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
  });

  return (
    <div className='flex flex-col space-y-4'>
      <Card>
        <TitleWithInfo title='Network Thresholds' info='Network Thresholds' variant='h5' />

        <Stats items={statsItems} className='pb-0' />

        <TimeProgress startTime={publicKey.start} endTime={publicKey.end} />

        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Chip color='green' className='uppercase'>
              {publicKey.isCurrent ? 'Current' : 'Next'}
            </Chip>
            <LabelWithValue label='session:' value={publicKey.session} />
            <Typography variant='body2' fw='semibold'>
              /
            </Typography>
            <KeyValueWithButton size='sm' keyValue={publicKey.compressed} />
          </div>
          <Button varirant='link' size='sm' className='uppercase'>
            <Link to='history'>View history</Link>
          </Button>
        </div>
      </Card>

      <CardTable
        titleProps={{
          title: 'Upcoming Thresholds',
          info: 'Upcoming Thresholds',
          variant: 'h5',
        }}
      >
        <Table tableProps={table as RTTable<unknown>} />
      </CardTable>

      <AuthoritiesTable />

      <Outlet />
    </div>
  );
};

export default Authorities;
