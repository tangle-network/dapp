import { CrossCircledIcon } from '@radix-ui/react-icons';
import { ZERO_BIG_INT } from '@tangle-network/dapp-config';
import { Spinner } from '@tangle-network/icons';
import { Search } from '@tangle-network/icons/Search';
import TableStatus from '@tangle-network/tangle-shared-ui/components/tables/TableStatus';
import {
  Input,
  KeyValueWithButton,
  Table,
  toBigInt,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  toSubstrateAddress,
  Typography,
} from '@tangle-network/ui-components';
import { Card } from '@tangle-network/ui-components/components/Card';
import {
  createColumnHelper,
  ExpandedState,
  getCoreRowModel,
  PaginationState,
  Row,
  useReactTable,
} from '@tanstack/react-table';
import cx from 'classnames';
import { useCallback, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { useLatestFinalizedBlock } from '../../../queries';
import { SyncProgressIndicator } from '../../indexingProgress';
import { BadgeEnum, BLOCK_COUNT_IN_SEVEN_DAYS } from '../constants';
import { useLeaderboard } from '../queries';
import { Account, PointsHistory, TestnetTaskCompletion } from '../types';
import { formatDisplayBlockNumber } from '../utils/formatDisplayBlockNumber';
import { BadgesCell } from './BadgesCell';
import { ExpandedInfo } from './ExpandedInfo';
import { HeaderCell } from './HeaderCell';
import { Overlay } from './Overlay';
import { FirstPlaceIcon, SecondPlaceIcon, ThirdPlaceIcon } from './RankIcon';
import { TrendIndicator } from './TrendIndicator';
import { MiniSparkline } from './MiniSparkline';

const COLUMN_ID = {
  RANK: 'RANK',
  ACCOUNT: 'account',
  BADGES: 'badges',
  TOTAL_POINTS: 'totalPoints',
  ACTIVITY: 'activity',
  POINTS_HISTORY: 'pointsHistory',
} as const;

const COLUMN_HELPER = createColumnHelper<Account>();

const RankIcon = ({ rank }: { rank: number }) => {
  switch (rank) {
    case 1:
      return <FirstPlaceIcon size="lg" />;
    case 2:
      return <SecondPlaceIcon size="lg" />;
    case 3:
      return <ThirdPlaceIcon size="lg" />;
    default:
      return <span className="inline-block px-1.5">{rank}</span>;
  }
};

const getColumns = (
  latestBlockNumber?: number | null,
  latestBlockTimestamp?: Date | null,
) => [
  COLUMN_HELPER.accessor('rank', {
    id: COLUMN_ID.RANK,
    header: () => <HeaderCell title="Rank" />,
    cell: (props) => {
      const rank = props.getValue();

      return <RankIcon rank={rank} />;
    },
  }),
  COLUMN_HELPER.accessor('id', {
    id: COLUMN_ID.ACCOUNT,
    header: () => <HeaderCell title="Account" />,
    cell: (props) => {
      const address = props.getValue();

      return (
        <div className="space-y-2">
          <KeyValueWithButton size="sm" keyValue={address} />
          <Typography
            variant="body2"
            className="text-gray-500 dark:text-gray-400"
          >
            Created{' '}
            {formatDisplayBlockNumber(
              props.row.original.createdAt,
              latestBlockNumber,
              latestBlockTimestamp,
            )}
          </Typography>
        </div>
      );
    },
  }),
  COLUMN_HELPER.accessor('badges', {
    id: COLUMN_ID.BADGES,
    header: () => <HeaderCell title="Badges" />,
    cell: (props) => <BadgesCell badges={props.getValue()} />,
  }),
  COLUMN_HELPER.accessor('totalPoints', {
    id: COLUMN_ID.TOTAL_POINTS,
    header: () => <HeaderCell title="Total Points" />,
    cell: ({ row }) => (
      <Tooltip>
        <TooltipTrigger>
          <div>{row.original.totalPoints.toLocaleString()}</div>
        </TooltipTrigger>
        <TooltipBody>
          <div>
            <div>
              Mainnet: {row.original.pointsBreakdown.mainnet.toLocaleString()}
            </div>
            <div>
              Testnet: {row.original.pointsBreakdown.testnet.toLocaleString()}
            </div>
          </div>
        </TooltipBody>
      </Tooltip>
    ),
  }),
  COLUMN_HELPER.accessor('activity', {
    id: COLUMN_ID.ACTIVITY,
    header: () => <HeaderCell title="Activity" />,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <Typography
          variant="body1"
          className="flex items-center gap-1 [&>svg]:flex-initial"
        >
          {row.original.activity.depositCount} deposits
        </Typography>

        <Typography
          variant="body1"
          className="flex items-center gap-1 [&>svg]:flex-initial"
        >
          {row.original.activity.delegationCount} delegations
        </Typography>
      </div>
    ),
  }),
  COLUMN_HELPER.display({
    id: COLUMN_ID.POINTS_HISTORY,
    header: () => <HeaderCell title="7-Day Points" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-baseline gap-4">
          <TrendIndicator pointsHistory={row.original.pointsHistory} />

          <MiniSparkline
            pointsHistory={row.original.pointsHistory}
            latestBlockNumber={latestBlockNumber}
          />
        </div>
      );
    },
  }),
];

export const LeaderboardTable = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  });

  // TODO: Add network tabs when we support both mainnet and testnet
  /* const [networkTab, setNetworkTab] = useState<'all' | 'mainnet' | 'testnet'>(
    'all',
  ); */

  const {
    data: latestBlock,
    isPending: isLatestBlockPending,
    error: latestBlockError,
  } = useLatestFinalizedBlock('testnet');

  const blockNumberSevenDaysAgo = useMemo(() => {
    if (isLatestBlockPending || latestBlockError) {
      return -1;
    }

    const result =
      latestBlock.testnetBlock.blockNumber - BLOCK_COUNT_IN_SEVEN_DAYS;

    return result < 0 ? 1 : result;
  }, [isLatestBlockPending, latestBlockError, latestBlock?.testnetBlock]);

  const accountQuery = useMemo(() => {
    if (!searchQuery) {
      return undefined;
    }

    try {
      const substrateAddress = toSubstrateAddress(searchQuery);

      return substrateAddress;
    } catch {
      return searchQuery;
    }
  }, [searchQuery]);

  const {
    data: leaderboardData,
    error,
    isPending,
    isFetching,
  } = useLeaderboard(
    pagination.pageSize,
    pagination.pageIndex * pagination.pageSize,
    blockNumberSevenDaysAgo,
    accountQuery,
  );

  const columns = useMemo(
    () =>
      getColumns(
        latestBlock?.testnetBlock.blockNumber,
        latestBlock?.testnetBlock.timestamp,
      ),
    [
      latestBlock?.testnetBlock.blockNumber,
      latestBlock?.testnetBlock.timestamp,
    ],
  );

  const data = useMemo<Account[]>(() => {
    if (!leaderboardData?.nodes) {
      return [] as Account[];
    }

    return leaderboardData.nodes
      .map((record, index) => {
        if (!record) {
          return null;
        }

        const totalPointsResult = toBigInt(record.totalPoints);

        if (totalPointsResult.error !== null) {
          console.error('Failed to convert totalPoints to bigint', record);
          return null;
        }

        const totalMainnetPointsResult = toBigInt(record.totalMainnetPoints);

        if (totalMainnetPointsResult.error !== null) {
          console.error(
            'Failed to convert totalMainnetPoints to bigint',
            record,
          );
          return null;
        }

        const totalTestnetPointsResult = toBigInt(record.totalTestnetPoints);

        if (totalTestnetPointsResult.error !== null) {
          console.error(
            'Failed to convert totalTestnetPoints to bigint',
            record,
          );
          return null;
        }

        const lastSevenDays = record.snapshots.nodes.reduce((acc, snapshot) => {
          if (!snapshot) {
            return acc;
          }

          const snapshotPointsResult = toBigInt(snapshot.totalPoints);

          if (snapshotPointsResult.error !== null) {
            console.error(
              'Failed to convert snapshot.totalPoints to bigint',
              snapshot,
            );
            return acc;
          }

          return acc + snapshotPointsResult.result;
        }, ZERO_BIG_INT);

        const badges: BadgeEnum[] = [];

        const hasDeposited = record.delegators?.nodes.find(
          (node) => node?.deposits.totalCount && node.deposits.totalCount > 0,
        );

        if (hasDeposited) {
          badges.push(BadgeEnum.RESTAKE_DEPOSITOR);
        }

        const hasDelegated = record.delegators?.nodes.find(
          (node) =>
            node?.delegations.totalCount && node.delegations.totalCount > 0,
        );

        if (hasDelegated) {
          badges.push(BadgeEnum.RESTAKE_DELEGATOR);
        }

        const hasLiquidStaked = record.lstPoolMembers.totalCount > 0;
        if (hasLiquidStaked) {
          badges.push(BadgeEnum.LIQUID_STAKER);
        }

        const hasNativeRestaked = record.delegators?.nodes.find(
          (node) =>
            node?.delegations.nodes &&
            node.delegations.nodes.find(
              (delegation) =>
                delegation?.assetId && delegation.assetId === `${ZERO_BIG_INT}`,
            ),
        );

        if (hasNativeRestaked) {
          badges.push(BadgeEnum.NATIVE_RESTAKER);
        }

        const isOperator = record.operators.totalCount > 0;
        if (isOperator) {
          badges.push(BadgeEnum.OPERATOR);
        }

        const isBlueprintOwner = record.blueprints.totalCount > 0;
        if (isBlueprintOwner) {
          badges.push(BadgeEnum.BLUEPRINT_OWNER);
        }

        const isServiceProvider = record.services.totalCount > 0;
        if (isServiceProvider) {
          badges.push(BadgeEnum.SERVICE_PROVIDER);
        }

        const isJobCaller = record.jobCalls.totalCount > 0;
        if (isJobCaller) {
          badges.push(BadgeEnum.JOB_CALLER);
        }

        const isNominator =
          Boolean(
            record.testnetTaskCompletions.nodes.find(
              (node) => node?.hasNominated,
            ),
          ) ?? false;
        if (isNominator) {
          badges.push(BadgeEnum.NOMINATOR);
        }

        const depositCount = record.delegators?.nodes.reduce((acc, node) => {
          if (!node) {
            return acc;
          }

          return acc + node.deposits.totalCount;
        }, 0);

        const delegationCount = record.delegators?.nodes.reduce((acc, node) => {
          if (!node) {
            return acc;
          }

          return acc + node.delegations.totalCount;
        }, 0);

        const testnetTask = record.testnetTaskCompletions.nodes.find(
          (node) => node !== null,
        );

        const testnetTaskCompletion:
          | Omit<TestnetTaskCompletion, 'completionPercentage'>
          | undefined = testnetTask
          ? {
              depositedThreeAssets: !!testnetTask.hasDepositedThreeAssets,
              delegatedAssets: !!testnetTask.hasDelegatedAssets,
              liquidStaked: !!testnetTask.hasLiquidStaked,
              nominated: !!testnetTask.hasNominated,
              nativeRestaked: !!testnetTask.hasNativeRestaked,
              bonus: !!testnetTask.hasBonusPoints,
            }
          : undefined;

        return {
          id: record.id,
          rank: pagination.pageIndex * pagination.pageSize + index + 1,
          totalPoints: totalPointsResult.result,
          pointsBreakdown: {
            mainnet: totalMainnetPointsResult.result,
            testnet: totalTestnetPointsResult.result,
            lastSevenDays,
          },
          badges,
          activity: {
            blueprintCount: record.blueprints.totalCount,
            depositCount,
            delegationCount,
            liquidStakingPoolCount: record.lstPoolMembers.totalCount,
            serviceCount: record.services.totalCount,
            jobCallCount: record.jobCalls.totalCount,
          },
          testnetTaskCompletion: testnetTaskCompletion
            ? {
                ...testnetTaskCompletion,
                completionPercentage:
                  (Object.values(testnetTaskCompletion).filter(Boolean).length /
                    Object.keys(testnetTaskCompletion).length) *
                  100,
              }
            : undefined,
          pointsHistory: record.snapshots.nodes
            .map((snapshot) => {
              if (!snapshot) {
                return null;
              }

              const snapshotPointsResult = toBigInt(snapshot.totalPoints);

              if (snapshotPointsResult.error !== null) {
                console.error(
                  'Failed to convert snapshot.totalPoints to bigint',
                  snapshot,
                );
                return null;
              }

              return {
                blockNumber: snapshot.blockNumber,
                points: snapshotPointsResult.result,
              };
            })
            .filter((item) => item !== null)
            .sort((a, b) => a.blockNumber - b.blockNumber)
            // Cumulate points for each day
            .reduce((acc, item, index) => {
              if (index === 0) {
                return [item];
              }

              const previousItem = acc[acc.length - 1];

              return [
                ...acc,
                { ...item, points: previousItem.points + item.points },
              ];
            }, [] as PointsHistory[]),
          createdAt: record.createdAt,
          lastUpdatedAt: record.lastUpdatedAt,
        } satisfies Account;
      })
      .filter((record) => record !== null);
  }, [leaderboardData?.nodes, pagination.pageIndex, pagination.pageSize]);

  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    enableSorting: false,
    state: {
      expanded,
      pagination,
    },
    rowCount: leaderboardData?.totalCount,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    onExpandedChange: setExpanded,
    getRowCanExpand: () => true,
  });

  const getExpandedRowContent = useCallback(
    (row: Row<Account>) => {
      return (
        <ExpandedInfo
          row={row}
          latestBlockNumber={latestBlock?.testnetBlock.blockNumber}
          latestBlockTimestamp={latestBlock?.testnetBlock.timestamp}
        />
      );
    },
    [
      latestBlock?.testnetBlock.blockNumber,
      latestBlock?.testnetBlock.timestamp,
    ],
  );

  return (
    <Card className="space-y-6 !bg-transparent !border-transparent p-0">
      <div className="flex items-center justify-between gap-4">
        {/* <TabsRoot
              className="max-w-xs flex-auto"
              value={networkTab}
              onValueChange={(tab) =>
                setNetworkTab(tab as 'all' | 'mainnet' | 'testnet')
              }
            >
              <TabsListWithAnimation>
                <TabsTriggerWithAnimation
                  className="min-h-8"
                  value="all"
                  isActive={networkTab === 'all'}
                  hideSeparator
                  labelVariant="body2"
                  labelClassName="py-1 px-0"
                >
                  <span className="block xs:hidden !text-inherit">All</span>

                  <span className="hidden xs:block !text-inherit">
                    All Networks
                  </span>
                </TabsTriggerWithAnimation>
                <TabsTriggerWithAnimation
                  className="min-h-8"
                  value="mainnet"
                  isActive={networkTab === 'mainnet'}
                  hideSeparator
                  labelVariant="body2"
                  labelClassName="py-1 px-0"
                >
                  Mainnet
                </TabsTriggerWithAnimation>
                <TabsTriggerWithAnimation
                  className="min-h-8"
                  value="testnet"
                  isActive={networkTab === 'testnet'}
                  hideSeparator
                  labelVariant="body2"
                  labelClassName="py-1 px-0"
                >
                  Testnet
                </TabsTriggerWithAnimation>
              </TabsListWithAnimation>
            </TabsRoot> */}

        <SyncProgressIndicator />

        <div className="flex items-center justify-end gap-2 grow">
          <Input
            className="grow max-w-xs"
            debounceTime={300}
            isControlled
            value={searchQuery}
            onChange={setSearchQuery}
            leftIcon={<Search />}
            id="search"
            placeholder="Search by address (Substrate or EVM)"
            size="md"
            inputClassName="py-1"
          />

          {/* <Button
                leftIcon={
                  <FilterIcon2 className="fill-current dark:fill-current" />
                }
                variant="utility"
                className="px-4 py-[7px]"
              >
                Filter
              </Button> */}
        </div>
      </div>

      {isPending ? (
        <TableStatus
          className="min-h-80"
          icon={<Spinner size="2xl" />}
          title="Loading..."
          description="Loading leaderboard data..."
        />
      ) : error && data.length === 0 ? (
        <TableStatus
          className="min-h-80"
          icon={<CrossCircledIcon className="fill-red-500" />}
          title="Error loading leaderboard data"
          description="Please try again later."
        />
      ) : data.length === 0 ? (
        <TableStatus
          className="min-h-80"
          title="No data found"
          description="No data found for the given query"
        />
      ) : (
        <div className="relative">
          <Table
            tableProps={table}
            isPaginated
            totalRecords={leaderboardData?.totalCount}
            getExpandedRowContent={getExpandedRowContent}
            className={cx('dark:border-mono-180')}
            thClassName={cx('dark:border-mono-180')}
            paginationClassName="dark:border-mono-180"
            trClassName="cursor-pointer dark:hover:bg-mono-190"
            tdClassName={cx(
              'group-hover/tr:bg-mono-20 dark:group-hover/tr:bg-mono-190',
              'dark:bg-mono-200 dark:border-mono-180',
            )}
            expandedRowClassName={twMerge(
              'dark:bg-mono-200',
              'peer-[&[data-expanded="true"]:hover]:bg-mono-20',
              'peer-[&[data-expanded="true"]:hover]:dark:bg-mono-190',
            )}
            onRowClick={(row) => {
              table.resetExpanded();
              table.setExpanded({ [row.id]: !row.getIsExpanded() });
            }}
          />

          {isFetching ? (
            <Overlay>
              <Spinner size="2xl" />
            </Overlay>
          ) : error ? (
            <Overlay className="flex flex-col gap-6 justify-center">
              <CrossCircledIcon className="stroke-red-500 size-12" />

              <div className="space-y-2">
                <Typography variant="h4" component="h3">
                  Error while fetching leaderboard data
                </Typography>

                <Typography variant="body1" component="p">
                  Error name: {error.name}
                </Typography>

                <Typography variant="body1" component="p">
                  Error message: {error.message}
                </Typography>
              </div>
            </Overlay>
          ) : null}
        </div>
      )}
    </Card>
  );
};
