import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  Table as RTTable,
  useReactTable,
} from '@tanstack/react-table';
import { useStatsContext } from '../provider/stats-provider';
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
} from '@webb-tools/webb-ui-components';
import { fuzzyFilter } from '@webb-tools/webb-ui-components';
import { Spinner } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components';
import { ComponentProps, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

import { AuthoritiesTable } from '../containers';
import {
  DiscreteList,
  UpcomingThreshold,
  useThresholds,
} from '../provider/hooks';
import { getChipColorByKeyType } from '../utils';

const columnHelper = createColumnHelper<UpcomingThreshold>();

const columns: ColumnDef<UpcomingThreshold, any>[] = [
  columnHelper.accessor('stats', {
    header: 'Status',
    cell: (props) => (
      <Chip color={getChipColorByKeyType(props.getValue())}>
        {props.getValue<string>()}
      </Chip>
    ),
  }),

  columnHelper.accessor('session', {
    header: 'Session',
  }),

  columnHelper.accessor('keyGen', {
    header: 'Keygen',
  }),

  columnHelper.accessor('signature', {
    header: 'Signature',
  }),

  columnHelper.accessor('authoritySet', {
    header: () => (
      <Typography
        variant="body1"
        fw="bold"
        ta="right"
        className="!text-inherit"
      >
        Authority Set
      </Typography>
    ),

    cell: (props) => {
      const authorities = props.getValue<DiscreteList>();
      if (!authorities.count) {
        return (
          <Typography variant="body1" ta="right">
            -
          </Typography>
        );
      }

      return (
        <AvatarGroup total={authorities.count} className="justify-end">
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

  const data = useMemo(
    () => (upComingThresholds ? Object.values(upComingThresholds) : []),
    [upComingThresholds]
  );

  const table = useReactTable<UpcomingThreshold>({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
  });

  const { keyGen, publicKey, signature } = threshold ?? {};
  const isLoading =
    thresholds.isLoading ||
    keyGen === undefined ||
    signature === undefined ||
    publicKey === undefined;
  const { time } = useStatsContext();

  return (
    <div className="flex flex-col space-y-4">
      <Card>
        <TitleWithInfo
          title="Network Thresholds"
          info="Network Thresholds"
          variant="h5"
        />

        {isLoading ? (
          <div className="flex items-center justify-center min-w-full min-h-[235px]">
            <Spinner size="xl" />
          </div>
        ) : (
          <>
            <Stats items={statsItems} className="pb-0" />

            <TimeProgress
              startTime={publicKey.start ?? null}
              endTime={publicKey.end ?? null}
              now={time}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Chip color="green">
                  {publicKey.isCurrent ? 'Current' : 'Next'}
                </Chip>
                <LabelWithValue label="session:" value={publicKey.session} />
                <Typography variant="body2" fw="semibold">
                  /
                </Typography>
                <KeyValueWithButton size="sm" keyValue={publicKey.compressed} />
              </div>

              <Button variant="link" size="sm">
                <Link to="history">View history</Link>
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
        {isLoading ? (
          <div className="flex items-center justify-center min-w-full min-h-[235px]">
            <Spinner size="xl" />
          </div>
        ) : (
          <Table tableProps={table as RTTable<unknown>} title="Thresholds" />
        )}
      </CardTable>

      <AuthoritiesTable />

      <Outlet />
    </div>
  );
};

export default Authorities;
