import { randBoolean, randEthereumAddress, randNumber, randRecentDate, randSoonDate } from '@ngneat/falso';
import { ColumnDef, createColumnHelper, getCoreRowModel, Table as RTTable, useReactTable } from '@tanstack/react-table';
import { useStatsContext } from '@webb-dapp/page-statistics/provider/stats-provider';
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
import { Spinner } from '@webb-dapp/webb-ui-components/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import { arrayFrom, randAccount32 } from '@webb-dapp/webb-ui-components/utils';
import { ComponentProps, useMemo } from 'react';
import { Outlet } from 'react-router-dom';

import { AuthoritiesTable } from '../containers';
import { DiscreteList, Thresholds, UpcomingThreshold, UpcomingThresholds, useThresholds } from '../provider/hooks';
import { getChipColorByKeyType } from '../utils';

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
      const authorities = props.getValue<DiscreteList>();
      return (
        <AvatarGroup total={authorities.count} className='justify-end'>
          {authorities.firstElements.map((au, idx) => (
            <Avatar sourceVariant={'address'} key={`${au}${idx}`} value={au} />
          ))}
        </AvatarGroup>
      );
    },
  }),
];

const Authorities = () => {
  const thresholds = useThresholds();
  const [threshold, upComingThresholds] = useMemo(() => {
    if (thresholds.val) {
      return thresholds.val;
    }
    return [null, null];
  }, [thresholds]);
  const statsItems = useMemo<ComponentProps<typeof Stats>['items']>(() => {
    const threshold = thresholds.val?.[0];
    return [
      {
        titleProps: {
          title: 'Keygen',
          info: 'Keygen',
        },
        value: threshold?.keyGen ?? 'loading..',
      },
      {
        titleProps: {
          title: 'Signature',
          info: 'Signature',
        },
        value: threshold?.signature ?? 'loading..',
      },
    ];
  }, [thresholds]);

  const data = useMemo(() => (upComingThresholds ? Object.values(upComingThresholds) : []), [upComingThresholds]);

  const table = useReactTable<UpcomingThreshold>({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
  });
  const { keyGen, publicKey, signature } = threshold! ?? {};
  const isLoading = !thresholds || thresholds?.isLoading || !keyGen || !signature || !publicKey;
  const { time } = useStatsContext();
  return (
    <div className='flex flex-col space-y-4'>
      <Card>
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <TitleWithInfo title='Network Thresholds' info='Network Thresholds' variant='h5' />

            <Stats items={statsItems} className='pb-0' />

            <TimeProgress startTime={publicKey.start ?? null} endTime={publicKey.end ?? null} now={time} />

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
                View history
              </Button>
            </div>
          </>
        )}
      </Card>

      <CardTable
        titleProps={{
          title: 'Upcoming Thresholds',
          info: 'Upcoming Thresholds',
          variant: 'h5',
        }}
      >
        {thresholds.isLoading ? <Spinner /> : <Table tableProps={table as RTTable<unknown>} />}
      </CardTable>

      <AuthoritiesTable />

      <Outlet />
    </div>
  );
};

export default Authorities;
