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
import { AuthoritySet, UpcomingThreshold } from '../provider/hooks';
import { getChipColorByKeyType } from '../utils';

const columnHelper = createColumnHelper<UpcomingThreshold>();

const columns = [
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
      const authorities = props.getValue<AuthoritySet>();

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
  const {
    dkgDataFromPolkadotAPI: {
      keygenThreshold,
      signatureThreshold,
      currentKey,
      currentSessionNumber,
      currentSessionTimeFrame: { start: sessionStart, end: sessionEnd },
      nextAuthorities,
    },
  } = useStatsContext();

  const statsItems = useMemo<ComponentProps<typeof Stats>['items']>(() => {
    return [
      {
        titleProps: {
          title: 'Keygen',
        },
        value: keygenThreshold ?? 'loading..',
      },
      {
        titleProps: {
          title: 'Signature',
        },
        value: signatureThreshold ?? 'loading..',
      },
    ];
  }, [keygenThreshold, signatureThreshold]);

  const data: UpcomingThreshold[] = useMemo(() => {
    return [
      {
        stats: 'Next' as const,
        session: String(currentSessionNumber + 1),
        keyGen: String(keygenThreshold),
        signature: String(signatureThreshold),
        authoritySet: {
          count: nextAuthorities.length,
          firstElements: nextAuthorities,
        },
        proposer: '',
      },
    ];
  }, [
    currentSessionNumber,
    keygenThreshold,
    nextAuthorities,
    signatureThreshold,
  ]);

  const table = useReactTable<UpcomingThreshold>({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
  });

  const isLoading =
    !currentSessionNumber ||
    !keygenThreshold ||
    !signatureThreshold ||
    nextAuthorities.length === 0 ||
    !sessionStart ||
    !sessionEnd;

  return (
    <div className="flex flex-col space-y-4">
      <Card>
        <TitleWithInfo
          title="Network Thresholds"
          info="Minimum participants needed for key generation (keygen) and signing a valid signature in Distributed Key Generation (DKG)."
          variant="h5"
        />

        {isLoading ? (
          <div className="flex items-center justify-center min-w-full min-h-[235px]">
            <Spinner size="xl" />
          </div>
        ) : (
          <>
            <Stats items={statsItems} className="pb-0" />

            <TimeProgress startTime={sessionStart} endTime={sessionEnd} />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Chip color="green">
                  {currentSessionNumber ? 'Current' : 'Next'}
                </Chip>
                <LabelWithValue label="session:" value={currentSessionNumber} />
                <Typography variant="body2" fw="semibold">
                  /
                </Typography>
                <Link to={`/keys/drawer/${currentKey}`}>
                  <KeyValueWithButton
                    size="sm"
                    label="key:"
                    keyValue={currentKey}
                    className="hover:underline"
                  />
                </Link>
              </div>

              {/* <Button variant="link" size="sm">
                <Link to="history">View history</Link>
              </Button> */}
            </div>
          </>
        )}
      </Card>

      <CardTable
        titleProps={{
          title: 'Upcoming Thresholds',
          info: 'Minimum participants needed for key generation (keygen) and signing a valid signature in Distributed Key Generation (DKG) in the next session.',
          variant: 'h5',
        }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center min-w-full min-h-[235px]">
            <Spinner size="xl" />
          </div>
        ) : (
          <Table tableProps={table} title="Thresholds" />
        )}
      </CardTable>

      <AuthoritiesTable />

      <Outlet />
    </div>
  );
};

export default Authorities;
