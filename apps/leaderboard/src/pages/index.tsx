import Keyring from '@polkadot/keyring';
import { cryptoWaitReady, mnemonicGenerate } from '@polkadot/util-crypto';
import {
  ArrowDownIcon,
  AwardIcon,
  CheckSquareIcon,
  FileTextIcon,
  FilterIcon,
  Search,
  UsersIcon,
} from '@tangle-network/icons';
import {
  Button,
  Card,
  Input,
  Progress,
  Table,
  TabsListWithAnimation,
  TabsRoot,
  TabsTriggerWithAnimation,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
  ValidatorIdentity,
} from '@tangle-network/ui-components';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import {
  createColumnHelper,
  ExpandedState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { BadgeEnum, BadgesCell } from '../components/tables/BadgesCell';
import HeaderCell from '../components/tables/HeaderCell';
import { formatTimeAgo } from '../utils/formatTimeAgo';
import IndexingProgressCard from '../components/IndexingProgressCard';

// Define types for our data
interface PointsBreakdown {
  mainnet: number;
  testnet: number;
  lastSevenDays: number;
}

interface AccountActivity {
  services: number;
  jobCalls: number;
  delegations: number;
}

interface TestnetTaskCompletion {
  depositedThreeAssets: boolean;
  delegatedAssets: boolean;
  liquidStaked: boolean;
  nominated: boolean;
  nativeRestaked: boolean;
  bonus: boolean;
  completionPercentage: number;
}

interface Account {
  id: string;
  rank: number;
  totalPoints: number;
  pointsBreakdown: PointsBreakdown;
  roles: BadgeEnum[];
  createdAt: Date;
  activity: AccountActivity;
  testnetTaskCompletion?: TestnetTaskCompletion;
  pointsHistory: {
    blockNumber: number;
    points: number;
  }[];
  lastUpdated: Date;
}

// Mock data generator
const generateMockData = (count: number): Account[] => {
  const keyring = new Keyring({ type: 'sr25519' });

  return Array.from({ length: count }, (_, i) => {
    const mnemonic = mnemonicGenerate();
    const pair = keyring.createFromUri(mnemonic);

    const isValidator = Math.random() > 0.5;
    const isOperator = Math.random() > 0.5;
    const isDepositor = Math.random() > 0.5;
    const isDelegator = Math.random() > 0.4;
    const isLiquidStaker = Math.random() > 0.6;
    const isNativeRestaker = Math.random() > 0.7;
    const isBlueprintOwner = Math.random() > 0.8;
    const isServiceProvider = Math.random() > 0.9;
    const isJobCaller = Math.random() > 0.95;

    const roles: BadgeEnum[] = [];
    if (isValidator) roles.push(BadgeEnum.VALIDATOR);
    if (isOperator) roles.push(BadgeEnum.OPERATOR);
    if (isDepositor) roles.push(BadgeEnum.RESTAKE_DEPOSITOR);
    if (isDelegator) roles.push(BadgeEnum.RESTAKE_DELEGATOR);
    if (isLiquidStaker) roles.push(BadgeEnum.LIQUID_STAKER);
    if (isNativeRestaker) roles.push(BadgeEnum.NATIVE_RESTAKER);
    if (isBlueprintOwner) roles.push(BadgeEnum.BLUEPRINT_OWNER);
    if (isServiceProvider) roles.push(BadgeEnum.SERVICE_PROVIDER);
    if (isJobCaller) roles.push(BadgeEnum.JOB_CALLER);

    const mainnetPoints = Math.floor(Math.random() * 10000);
    const testnetPoints = Math.floor(Math.random() * 5000);

    const daysAgo = Math.floor(Math.random() * 365);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    const lastSevenDaysPoints = Math.floor(Math.random() * 500);

    const services = Math.floor(Math.random() * 20);
    const jobCalls = Math.floor(Math.random() * 100);
    const delegations = Math.floor(Math.random() * 30);

    const pointsHistory = Array.from({ length: 12 }, () => ({
      blockNumber: Math.floor(Math.random() * 1_000_000),
      points: Math.floor(Math.random() * 1_000),
    }));

    const lastUpdated = new Date();
    lastUpdated.setHours(
      lastUpdated.getHours() - Math.floor(Math.random() * 72),
    );

    const completionTasks = {
      depositedThreeAssets: Math.random() > 0.3,
      delegatedAssets: Math.random() > 0.4,
      liquidStaked: Math.random() > 0.5,
      nominated: Math.random() > 0.6,
      nativeRestaked: Math.random() > 0.7,
      bonus: Math.random() > 0.8,
    };

    const completedTasksCount =
      Object.values(completionTasks).filter(Boolean).length;
    const completionPercentage = (completedTasksCount / 6) * 100;

    return {
      id: pair.address,
      rank: i + 1,
      totalPoints: mainnetPoints + testnetPoints,
      pointsBreakdown: {
        mainnet: mainnetPoints,
        testnet: testnetPoints,
        lastSevenDays: lastSevenDaysPoints,
      },
      roles,
      createdAt,
      activity: {
        services,
        jobCalls,
        delegations,
      },
      testnetTaskCompletion: {
        ...completionTasks,
        completionPercentage,
      },
      pointsHistory,
      lastUpdated,
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints);
};

const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1)
    return (
      <div className="text-xl font-bold">
        <span role="img" aria-label="gold medal">
          🥇
        </span>{' '}
        {rank}
      </div>
    );
  if (rank === 2)
    return (
      <div className="text-xl font-bold">
        <span role="img" aria-label="silver medal">
          🥈
        </span>{' '}
        {rank}
      </div>
    );
  if (rank === 3)
    return (
      <div className="text-xl font-bold">
        <span role="img" aria-label="bronze medal">
          🥉
        </span>{' '}
        {rank}
      </div>
    );
  return <div className="text-lg font-medium">{rank}</div>;
};

const TrendIndicator = ({ value }: { value: number }) => {
  if (value > 100) {
    return (
      <Typography variant="body1" className="flex items-center gap-1">
        {value}{' '}
        <ArrowDownIcon
          size="lg"
          className="fill-green-600 dark:fill-green-400 -rotate-[135deg]"
        />
      </Typography>
    );
  } else if (value < 50) {
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

const MiniSparkline = ({ data }: { data: number[] }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div className="flex items-end h-8 space-x-[2px]">
      {data.map((value, index) => {
        const height = ((value - min) / range) * 100;
        return (
          <div
            key={index}
            className="w-1 bg-blue-500 dark:bg-blue-600"
            style={{ height: `${Math.max(10, height)}%` }}
          />
        );
      })}
    </div>
  );
};

// Main component
export default function IndexPage() {
  // States
  const [data, setData] = useState<Account[]>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'rank', desc: false },
  ]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [networkTab, setNetworkTab] = useState<'all' | 'mainnet' | 'testnet'>(
    'all',
  );

  useEffect(() => {
    let isMounted = true;

    (async function () {
      await cryptoWaitReady();
      const data = generateMockData(100);

      if (isMounted) {
        setData(data);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter the data based on available UI controls
  const filteredData = useMemo(() => {
    return data.filter((account) => {
      // Search filter
      if (
        searchQuery &&
        !account.id.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Network tab filter (this would be more complex in a real implementation)
      if (networkTab === 'mainnet' && account.pointsBreakdown.mainnet === 0)
        return false;
      if (networkTab === 'testnet' && account.pointsBreakdown.testnet === 0)
        return false;

      return true;
    });
  }, [data, searchQuery, networkTab]);

  // Column helper
  const columnHelper = createColumnHelper<Account>();

  // Define columns
  const columns = useMemo(
    () => [
      columnHelper.accessor('rank', {
        header: () => <HeaderCell title="Rank" />,
        cell: ({ row }) => <RankBadge rank={row.original.rank} />,
      }),
      columnHelper.accessor('id', {
        header: () => <HeaderCell title="Account" />,
        cell: (props) => {
          const address = props.getValue() as SubstrateAddress;

          return (
            <ValidatorIdentity
              avatarSize="md"
              address={address}
              accountExplorerUrl="https://tangle.tools"
              subContent={
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Created {formatTimeAgo(props.row.original.createdAt)}
                </div>
              }
            />
          );
        },
      }),
      columnHelper.accessor('roles', {
        header: () => <HeaderCell title="Badges" />,
        cell: ({ row }) => <BadgesCell badges={row.original.roles} />,
      }),
      columnHelper.accessor('totalPoints', {
        header: () => <HeaderCell title="Total Points" />,
        cell: ({ row }) => (
          <Tooltip>
            <TooltipTrigger>
              <div>{row.original.totalPoints.toLocaleString()}</div>
            </TooltipTrigger>
            <TooltipBody>
              <div>
                <div>
                  Mainnet:{' '}
                  {row.original.pointsBreakdown.mainnet.toLocaleString()}
                </div>
                <div>
                  Testnet:{' '}
                  {row.original.pointsBreakdown.testnet.toLocaleString()}
                </div>
              </div>
            </TooltipBody>
          </Tooltip>
        ),
      }),
      columnHelper.accessor('activity', {
        header: () => <HeaderCell title="Activity" />,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <Typography
              variant="body1"
              className="flex items-center gap-1 [&>svg]:flex-initial"
            >
              <FileTextIcon />
              {row.original.activity.services} services
            </Typography>

            <Typography
              variant="body1"
              className="flex items-center gap-1 [&>svg]:flex-initial"
            >
              <CheckSquareIcon />
              {row.original.activity.jobCalls} job calls
            </Typography>

            <Typography
              variant="body1"
              className="flex items-center gap-1 [&>svg]:flex-initial"
            >
              <UsersIcon />
              {row.original.activity.delegations} delegations
            </Typography>
          </div>
        ),
      }),
      columnHelper.accessor('pointsBreakdown.lastSevenDays', {
        header: () => <HeaderCell title="7-Day Points" />,
        cell: ({ row }) => (
          <TrendIndicator value={row.original.pointsBreakdown.lastSevenDays} />
        ),
      }),
      columnHelper.accessor('pointsHistory', {
        header: () => <HeaderCell title="Points Trend" />,
        cell: ({ row }) => (
          <MiniSparkline
            data={row.original.pointsHistory.map((p) => p.points)}
          />
        ),
      }),
    ],
    [columnHelper],
  );

  // Table instance
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      expanded,
    },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowCanExpand: () => true,
  });

  // Expanded row content
  const expandedContent = (row: Row<Account>) => {
    const account = row.original;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
        <Card className="bg-mono-40/50 dark:bg-mono-200 space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Account Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Account ID:</span>

                <ValidatorIdentity
                  showAddressInTooltip
                  address={account.id as SubstrateAddress}
                />
              </div>
              <div className="flex justify-between">
                <span>Created:</span>
                <span>{account.createdAt.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span>{formatTimeAgo(account.lastUpdated)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Points Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Mainnet Points:</span>
                <span>{account.pointsBreakdown.mainnet.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Testnet Points:</span>
                <span>{account.pointsBreakdown.testnet.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Last 7 Days:</span>
                <span>
                  {account.pointsBreakdown.lastSevenDays.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-mono-40/50 dark:bg-mono-200 space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Activity Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Services:</span>
                <span>{account.activity.services}</span>
              </div>
              <div className="flex justify-between">
                <span>Job Calls:</span>
                <span>{account.activity.jobCalls}</span>
              </div>
              <div className="flex justify-between">
                <span>Delegations:</span>
                <span>{account.activity.delegations}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              Testnet Task Completion
            </h3>
            {account.testnetTaskCompletion && (
              <div className="space-y-3">
                <div>
                  <Progress
                    value={account.testnetTaskCompletion.completionPercentage}
                    className="h-2 mb-2"
                  />
                  <div className="text-sm text-right">
                    {Math.round(
                      account.testnetTaskCompletion.completionPercentage,
                    )}
                    % Complete
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${account.testnetTaskCompletion.depositedThreeAssets ? 'bg-green-500' : 'bg-gray-300'}`}
                    ></div>
                    <span>Deposited 3+ Assets</span>
                  </div>
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${account.testnetTaskCompletion.delegatedAssets ? 'bg-green-500' : 'bg-gray-300'}`}
                    ></div>
                    <span>Delegated Assets</span>
                  </div>
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${account.testnetTaskCompletion.liquidStaked ? 'bg-green-500' : 'bg-gray-300'}`}
                    ></div>
                    <span>Liquid Staked</span>
                  </div>
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${account.testnetTaskCompletion.nominated ? 'bg-green-500' : 'bg-gray-300'}`}
                    ></div>
                    <span>Nominated</span>
                  </div>
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${account.testnetTaskCompletion.nativeRestaked ? 'bg-green-500' : 'bg-gray-300'}`}
                    ></div>
                    <span>Native Restaked</span>
                  </div>
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${account.testnetTaskCompletion.bonus ? 'bg-green-500' : 'bg-gray-300'}`}
                    ></div>
                    <span>Bonus Points</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto space-y-6">
      <div className="max-w-xl">
        <Typography
          variant="h3"
          component="h1"
          className="font-semibold antialiased flex items-center gap-1"
        >
          <AwardIcon width={28} height={28} />
          Account Leaderboard
        </Typography>
        <Typography
          variant="body1"
          className="text-mono-100 dark:text-mono-120"
        >
          Tangle leaderboard ranks contributors based on points earned from
          network activities like staking, nominating, and running services.
        </Typography>
      </div>

      <IndexingProgressCard />

      <Card className="overflow-hidden space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-between gap-4">
          <TabsRoot
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
          </TabsRoot>

          <div className="flex items-center justify-end gap-2">
            <Input
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

            <Button
              leftIcon={
                <FilterIcon className="fill-current dark:fill-current" />
              }
              variant="utility"
              className="px-4 py-[7px]"
            >
              Filter
            </Button>
          </div>
        </div>

        {/* <div className="overflow-auto max-h-[70vh]"> */}
        <Table
          tableProps={table}
          isPaginated={true}
          totalRecords={filteredData.length}
          getExpandedRowContent={expandedContent}
          onRowClick={(row) => {
            table.resetExpanded();
            table.setExpanded({ [row.id]: !row.getIsExpanded() });
          }}
        />
        {/* </div> */}
      </Card>
    </div>
  );
}
