import { CircleIcon } from '@radix-ui/react-icons';
import { BLOCK_TIME_MS, ZERO_BIG_INT } from '@tangle-network/dapp-config';
import {
  ArrowDownIcon,
  BookLockIcon,
  CheckboxCircleFill,
  Spinner,
  UsersIcon,
  WavesLadderIcon,
} from '@tangle-network/icons';
import { Search } from '@tangle-network/icons/Search';
import {
  Input,
  KeyValueWithButton,
  Progress,
  Table,
  toBigInt,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
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
import { useCallback, useMemo, useState } from 'react';
import { useLatestFinalizedBlock } from '../../queries/latestFinalizedBlock';
import { useLeaderboard } from '../../queries/leaderboard';
import { formatTimeAgo } from '../../utils/formatTimeAgo';
import { BadgeEnum, BadgesCell } from './BadgesCell';
import HeaderCell from './HeaderCell';
import { Account, PointsHistory, TestnetTaskCompletion } from './types';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const BLOCK_COUNT_IN_ONE_DAY = Math.floor(ONE_DAY_IN_MS / BLOCK_TIME_MS);
const BLOCK_COUNT_IN_SEVEN_DAYS = BLOCK_COUNT_IN_ONE_DAY * 7;

const TrendIndicator = ({
  pointsHistory,
}: {
  pointsHistory: Account['pointsHistory'];
}) => {
  if (pointsHistory.length === 0) {
    return <div>0</div>;
  }

  const diff =
    pointsHistory[pointsHistory.length - 1].points - pointsHistory[0].points;

  const direction = diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral';
  const value = pointsHistory[pointsHistory.length - 1].points.toLocaleString();

  if (direction === 'up') {
    return (
      <Typography variant="body1" className="flex items-center gap-1">
        {value}{' '}
        <ArrowDownIcon
          size="lg"
          className="fill-green-600 dark:fill-green-400 -rotate-[135deg]"
        />
      </Typography>
    );
  } else if (direction === 'down') {
    return (
      <Typography variant="body1" className="flex items-center gap-1">
        {value}{' '}
        <ArrowDownIcon
          size="lg"
          className="fill-red-600 dark:fill-red-400 -rotate-45"
        />
      </Typography>
    );
  }

  return <div>{value}</div>;
};

const MiniSparkline = ({
  pointsHistory,
  latestBlockNumber,
}: {
  pointsHistory: Account['pointsHistory'];
  latestBlockNumber?: number | null;
}) => {
  if (pointsHistory.length === 0) {
    return <div>No data</div>;
  }

  // Cumulate points for each day
  const cumulatedPoints = !latestBlockNumber
    ? pointsHistory.map((snapshot) => snapshot.points)
    : pointsHistory
        .reduce(
          (acc, snapshot) => {
            // Calculate which day this block belongs to (0-6, where 0 is today)
            const blocksAgo = latestBlockNumber - snapshot.blockNumber;
            const day = Math.floor(blocksAgo / BLOCK_COUNT_IN_ONE_DAY);

            // Only process blocks within the last 7 days
            if (day >= 0 && day < 7) {
              acc[day] = acc[day] + snapshot.points;
            } else {
              console.error('Block number out of range', snapshot);
            }

            return acc;
          },
          Array.from({ length: 7 }, () => ZERO_BIG_INT),
        )
        .slice()
        .reverse();

  const max = cumulatedPoints.reduce((acc, curr) => {
    if (curr > acc) {
      return curr;
    }

    return acc;
  }, cumulatedPoints[0]);

  const min = cumulatedPoints.reduce((acc, curr) => {
    if (curr < acc) {
      return curr;
    }

    return acc;
  }, cumulatedPoints[0]);

  const range = max - min || BigInt(1);

  return (
    <div className="flex items-end h-8 space-x-[2px]">
      {cumulatedPoints.map((value, index) => {
        const height =
          ((value - min) * BigInt(100) * BigInt(10_000)) /
          range /
          BigInt(10_000);

        const maxHeight = height < BigInt(10) ? BigInt(10) : height;

        return (
          <div
            key={index}
            className="w-1 bg-blue-500 dark:bg-blue-600"
            style={{ height: `${maxHeight}%` }}
          />
        );
      })}
    </div>
  );
};

const COLUMN_HELPER = createColumnHelper<Account>();

const getColumns = (
  latestBlockNumber?: number | null,
  latestBlockTimestamp?: Date | null,
) => [
  COLUMN_HELPER.accessor('id', {
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
    header: () => <HeaderCell title="Badges" />,
    cell: (props) => <BadgesCell badges={props.getValue()} />,
  }),
  COLUMN_HELPER.accessor('totalPoints', {
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
    header: () => <HeaderCell title="Activity" />,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <Typography
          variant="body1"
          className="flex items-center gap-1 [&>svg]:flex-initial"
        >
          <BookLockIcon />
          {row.original.activity.depositCount} deposits
        </Typography>

        <Typography
          variant="body1"
          className="flex items-center gap-1 [&>svg]:flex-initial"
        >
          <UsersIcon />
          {row.original.activity.delegationCount} delegations
        </Typography>

        <Typography
          variant="body1"
          className="flex items-center gap-1 [&>svg]:flex-initial"
        >
          <WavesLadderIcon />
          {row.original.activity.liquidStakingPoolCount} lst pools
        </Typography>
      </div>
    ),
  }),
  COLUMN_HELPER.display({
    id: 'Trending',
    header: () => <HeaderCell title="7-Day Points" />,
    cell: ({ row }) => {
      return <TrendIndicator pointsHistory={row.original.pointsHistory} />;
    },
  }),
  COLUMN_HELPER.accessor('pointsHistory', {
    header: () => <HeaderCell title="Points Trend" />,
    cell: ({ row }) => (
      <MiniSparkline
        pointsHistory={row.original.pointsHistory}
        latestBlockNumber={latestBlockNumber}
      />
    ),
  }),
];

export const LeaderboardTable = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  // const [sorting, setSorting] = useState<SortingState>([]);

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

  const {
    data: leaderboardData,
    isPending,
    error,
  } = useLeaderboard(
    pagination.pageSize,
    pagination.pageIndex,
    blockNumberSevenDaysAgo,
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
      .map((record) => {
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
          lastUpdatedAt: record.lastUpdateAt,
        } satisfies Account;
      })
      .filter((record) => record !== null);
  }, [leaderboardData]);

  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    state: {
      // sorting,
      expanded,
      pagination,
    },
    rowCount: leaderboardData?.totalCount,
    // onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    // getSortedRowModel: getSortedRowModel(),
    getRowCanExpand: () => true,
  });

  const getExpandedRowContent = useCallback(
    (row: Row<Account>) => {
      return getExpandedContent(
        row,
        latestBlock?.testnetBlock.blockNumber,
        latestBlock?.testnetBlock.timestamp,
      );
    },
    [
      latestBlock?.testnetBlock.blockNumber,
      latestBlock?.testnetBlock.timestamp,
    ],
  );

  return (
    <Card className="overflow-hidden space-y-6">
      {isPending ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="2xl" />
        </div>
      ) : error && data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Typography variant="h3" className="text-red-500">
            Error Loading Leaderboard
          </Typography>
          <Typography variant="body1" className="text-gray-500">
            {error.message ||
              'Failed to load leaderboard data. Please try again later.'}
          </Typography>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Typography variant="h3" className="text-red-500">
            No data found
          </Typography>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 items-center justify-between gap-4">
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

            <div className="flex items-center justify-end gap-2">
              <Input
                className="grow max-w-xs"
                debounceTime={300}
                isControlled
                value={searchQuery}
                onChange={setSearchQuery}
                leftIcon={<Search />}
                id="search"
                placeholder="Search"
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

          <Table
            tableProps={table}
            isPaginated
            totalRecords={leaderboardData?.totalCount}
            getExpandedRowContent={getExpandedRowContent}
            onRowClick={(row) => {
              table.resetExpanded();
              table.setExpanded({ [row.id]: !row.getIsExpanded() });
            }}
          />
        </>
      )}
    </Card>
  );
};

function formatDisplayBlockNumber(
  blockNumber: number,
  latestBlockNumber?: number | null,
  latestBlockTimestamp?: Date | null,
) {
  if (latestBlockNumber && latestBlockTimestamp) {
    const date = new Date(
      latestBlockTimestamp.getTime() +
        (blockNumber - latestBlockNumber) * BLOCK_TIME_MS,
    );

    return formatTimeAgo(date);
  }

  return `Block: #${blockNumber}`;
}

const getExpandedContent = (
  row: Row<Account>,
  latestBlockNumber?: number | null,
  latestBlockTimestamp?: Date | null,
) => {
  const account = row.original;
  const address = account.id;

  // Helper function to render a detail row with label and value
  const DetailRow = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => (
    <div className="flex justify-between">
      <span>{label}:</span>
      <span>{value}</span>
    </div>
  );

  // Helper function to render task completion indicator
  const TaskIndicator = ({
    completed,
    label,
  }: {
    completed?: boolean;
    label: string;
  }) => (
    <div className="flex items-center gap-1 [&>svg]:flex-initial">
      {completed ? (
        <CheckboxCircleFill className="fill-green-500 dark:fill-green-400" />
      ) : (
        <CircleIcon />
      )}
      <span>{label}</span>
    </div>
  );

  // Helper function to create a section with title and content
  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="space-y-2">
      <Typography variant="h4" component="h3">
        {title}
      </Typography>
      <div className="space-y-2">{children}</div>
    </div>
  );

  const { testnetTaskCompletion } = account;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
      <Card className="bg-mono-40/50 dark:bg-mono-200 space-y-4">
        <Section title="Account Details">
          <DetailRow
            label="Account ID"
            value={<KeyValueWithButton size="sm" keyValue={address} />}
          />
          <DetailRow
            label="Created"
            value={formatDisplayBlockNumber(
              account.createdAt,
              latestBlockNumber,
              latestBlockTimestamp,
            )}
          />
          <DetailRow
            label="Last Updated"
            value={formatDisplayBlockNumber(
              account.lastUpdatedAt,
              latestBlockNumber,
              latestBlockTimestamp,
            )}
          />
        </Section>

        <Section title="Activity Details">
          <DetailRow label="Deposits" value={account.activity.depositCount} />
          <DetailRow
            label="Delegations"
            value={account.activity.delegationCount}
          />
          <DetailRow
            label="Liquid Staking Pools"
            value={account.activity.liquidStakingPoolCount}
          />
          <DetailRow label="Services" value={account.activity.serviceCount} />
        </Section>
      </Card>

      <Card className="bg-mono-40/50 dark:bg-mono-200 space-y-4">
        <Section title="Points Breakdown">
          <DetailRow
            label="Mainnet Points"
            value={account.pointsBreakdown.mainnet.toLocaleString()}
          />
          <DetailRow
            label="Testnet Points"
            value={account.pointsBreakdown.testnet.toLocaleString()}
          />
          <DetailRow
            label="Last 7 Days"
            value={account.pointsBreakdown.lastSevenDays.toLocaleString()}
          />
        </Section>

        <div className="space-y-2">
          <Typography variant="h4" component="h3">
            Testnet Task Completion
          </Typography>
          <div className="space-y-3">
            <div>
              <Progress
                value={testnetTaskCompletion?.completionPercentage ?? null}
                className="h-2 mb-2"
              />
              <div className="text-sm text-right">
                {testnetTaskCompletion
                  ? Math.round(testnetTaskCompletion.completionPercentage)
                  : 0}
                % Complete
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <TaskIndicator
                completed={testnetTaskCompletion?.depositedThreeAssets}
                label="Deposited 3+ Assets"
              />
              <TaskIndicator
                completed={testnetTaskCompletion?.delegatedAssets}
                label="Delegated Assets"
              />
              <TaskIndicator
                completed={testnetTaskCompletion?.liquidStaked}
                label="Liquid Staked"
              />
              <TaskIndicator
                completed={testnetTaskCompletion?.nominated}
                label="Nominated"
              />
              <TaskIndicator
                completed={testnetTaskCompletion?.nativeRestaked}
                label="Native Restaked"
              />
              <TaskIndicator
                completed={testnetTaskCompletion?.bonus}
                label="Bonus Points"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
