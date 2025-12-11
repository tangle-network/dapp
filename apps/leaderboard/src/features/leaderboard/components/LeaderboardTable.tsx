import { CrossCircledIcon } from '@radix-ui/react-icons';
import { Spinner } from '@tangle-network/icons';
import { Search } from '@tangle-network/icons/Search';
import TableStatus from '@tangle-network/tangle-shared-ui/components/tables/TableStatus';
import type { NetworkType } from '@tangle-network/tangle-shared-ui/graphql/graphql';
import {
  Input,
  KeyValueWithButton,
  Table,
  TabsListWithAnimation,
  TabsRoot,
  TabsTriggerWithAnimation,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@tangle-network/ui-components';
import { isEvmAddress } from '@tangle-network/ui-components/utils/isEvmAddress20';
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
import { useLatestTimestamp } from '../../../queries';
import { SyncProgressIndicator } from '../../indexingProgress';
import { RoleFilterEnum, SEVEN_DAYS_IN_SECONDS } from '../constants';
import {
  getAccountIdsForRoles,
  useLeaderboard,
  useRoleAccounts,
} from '../queries';
import { Account } from '../types';
import { createAccountExplorerUrl } from '../utils/createAccountExplorerUrl';
import { processLeaderboardRecord } from '../utils/processLeaderboardRecord';
import { BadgesCell } from './BadgesCell';
import { ExpandedInfo } from './ExpandedInfo';
import { HeaderCell } from './HeaderCell';
import { MiniSparkline } from './MiniSparkline';
import { Overlay } from './Overlay';
import { FirstPlaceIcon, SecondPlaceIcon, ThirdPlaceIcon } from './RankIcon';
import { RoleFilter } from './RoleFilter';
import { TrendIndicator } from './TrendIndicator';

const COLUMN_ID = {
  RANK: 'RANK',
  ACCOUNT: 'account',
  BADGES: 'badges',
  TOTAL_POINTS: 'totalPoints',
  POINTS_HISTORY: 'pointsHistory',
} as const;

const CLIENT_SIDE_FILTER_MIN_LENGTH = 3;
const CLIENT_SIDE_FILTER_PAGE_SIZE = 100;

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

const COLUMNS = [
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
      const accountNetwork = props.row.original.network;
      const updatedAt = props.row.original.updatedAtTimestamp;

      return (
        <div className="space-y-1">
          <a
            href={createAccountExplorerUrl(address, accountNetwork)}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            <KeyValueWithButton size="sm" keyValue={address} />
          </a>
          {updatedAt && (
            <Typography
              variant="body2"
              className="text-gray-500 dark:text-gray-400"
            >
              Updated {updatedAt.toLocaleDateString()}
            </Typography>
          )}
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
  COLUMN_HELPER.display({
    id: COLUMN_ID.POINTS_HISTORY,
    header: () => <HeaderCell title="7-Day Points" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-baseline gap-4">
          <TrendIndicator pointsHistory={row.original.pointsHistory} />

          <MiniSparkline pointsHistory={row.original.pointsHistory} />
        </div>
      );
    },
  }),
];

const getExpandedRowContent = (row: Row<Account>) => {
  return <ExpandedInfo row={row} />;
};

export const LeaderboardTable = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [selectedRoles, setSelectedRoles] = useState<RoleFilterEnum[]>([]);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  });

  const [networkTab, setNetworkTab] = useState<NetworkType>(
    'MAINNET' as NetworkType,
  );

  const handleRoleToggle = useCallback((role: RoleFilterEnum) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const handleClearRoles = useCallback(() => {
    setSelectedRoles([]);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const {
    data: latestTimestamp,
    isPending: isTimestampPending,
    error: timestampError,
  } = useLatestTimestamp(networkTab);

  const { data: roleAccounts, isPending: isRoleAccountsPending } =
    useRoleAccounts(networkTab);

  const roleFilteredAccountIds = useMemo(() => {
    if (selectedRoles.length === 0 || !roleAccounts) {
      return null;
    }
    return getAccountIdsForRoles(roleAccounts, selectedRoles);
  }, [selectedRoles, roleAccounts]);

  const roleCounts = useMemo(() => {
    if (!roleAccounts) return undefined;
    return {
      operators: roleAccounts.operators.size,
      restakers: roleAccounts.restakers.size,
      developers: roleAccounts.developers.size,
      customers: roleAccounts.customers.size,
    };
  }, [roleAccounts]);

  // Calculate timestamp for 7 days ago (Envio uses timestamps instead of block numbers)
  const timestampSevenDaysAgo = useMemo(() => {
    if (isTimestampPending || timestampError) {
      return -1;
    }

    const currentTimestamp =
      networkTab === 'MAINNET'
        ? latestTimestamp?.mainnetTimestamp
        : latestTimestamp?.testnetTimestamp;

    if (!currentTimestamp) {
      return -1;
    }

    return currentTimestamp - SEVEN_DAYS_IN_SECONDS;
  }, [isTimestampPending, timestampError, latestTimestamp, networkTab]);

  const accountQuery = useMemo(() => {
    if (!searchQuery) {
      return undefined;
    }

    const trimmedQuery = searchQuery.trim();

    // Use server-side filtering only for valid EVM addresses
    if (isEvmAddress(trimmedQuery)) {
      return trimmedQuery;
    }

    // Use client-side filtering for partial address matches
    return undefined;
  }, [searchQuery]);

  const shouldUseClientSideFiltering = useMemo(() => {
    const trimmedQuery = searchQuery.trim();
    return (
      trimmedQuery.length >= CLIENT_SIDE_FILTER_MIN_LENGTH && !accountQuery
    );
  }, [searchQuery, accountQuery]);

  const {
    data: leaderboardData,
    error,
    isPending,
    isFetching,
  } = useLeaderboard(
    networkTab,
    // Load more data when doing client-side filtering to ensure we don't miss results
    shouldUseClientSideFiltering
      ? Math.max(CLIENT_SIDE_FILTER_PAGE_SIZE, pagination.pageSize)
      : pagination.pageSize,
    shouldUseClientSideFiltering
      ? 0
      : pagination.pageIndex * pagination.pageSize,
    timestampSevenDaysAgo,
    accountQuery,
  );

  const data = useMemo<Account[]>(() => {
    if (!leaderboardData?.nodes) {
      return [] as Account[];
    }

    const processedData = leaderboardData.nodes
      .map((record, index) =>
        processLeaderboardRecord(
          record,
          index,
          pagination.pageIndex,
          pagination.pageSize,
          undefined, // activity data - loaded separately if needed
          networkTab,
        ),
      )
      .filter((record) => record !== null);

    let filteredData = processedData;

    // Apply role-based filtering
    if (roleFilteredAccountIds && roleFilteredAccountIds.size > 0) {
      filteredData = filteredData.filter((account) =>
        roleFilteredAccountIds.has(account.id.toLowerCase()),
      );
    }

    // Apply client-side filtering for address searches
    if (searchQuery && !accountQuery && shouldUseClientSideFiltering) {
      const trimmedQuery = searchQuery.trim().toLowerCase();
      filteredData = filteredData.filter((account) =>
        account.id.toLowerCase().includes(trimmedQuery),
      );
    }

    return filteredData;
  }, [
    leaderboardData?.nodes,
    pagination.pageIndex,
    pagination.pageSize,
    searchQuery,
    accountQuery,
    shouldUseClientSideFiltering,
    networkTab,
    roleFilteredAccountIds,
  ]);

  const table = useReactTable({
    data,
    columns: COLUMNS,
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

  return (
    <Card className="space-y-6 !bg-transparent !border-transparent p-0">
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Top row: Tabs and Sync indicator */}
        <div className="flex items-center gap-3 flex-wrap">
          <TabsRoot
            className="w-[180px]"
            value={networkTab}
            onValueChange={(tab) => setNetworkTab(tab as NetworkType)}
          >
            <TabsListWithAnimation className="flex-nowrap">
              <TabsTriggerWithAnimation
                value="MAINNET"
                isActive={networkTab === 'MAINNET'}
                hideSeparator
                labelVariant="body2"
                labelClassName="py-2 px-2"
              >
                Mainnet
              </TabsTriggerWithAnimation>
              <TabsTriggerWithAnimation
                value="TESTNET"
                isActive={networkTab === 'TESTNET'}
                hideSeparator
                labelVariant="body2"
                labelClassName="py-2 px-2"
              >
                Testnet
              </TabsTriggerWithAnimation>
            </TabsListWithAnimation>
          </TabsRoot>

          <SyncProgressIndicator network={networkTab} />
        </div>

        {/* Role filter */}
        <RoleFilter
          selectedRoles={selectedRoles}
          onRoleToggle={handleRoleToggle}
          onClearAll={handleClearRoles}
          isLoading={isRoleAccountsPending}
          roleCounts={roleCounts}
        />

        {/* Bottom row: Search */}
        <div className="flex items-center gap-2">
          <Input
            className="grow sm:max-w-xs"
            debounceTime={300}
            isControlled
            value={searchQuery}
            onChange={setSearchQuery}
            leftIcon={<Search />}
            rightIcon={
              isFetching && shouldUseClientSideFiltering ? (
                <Spinner size="lg" />
              ) : undefined
            }
            id="search"
            placeholder="Search by address"
            size="md"
            inputClassName="py-1"
          />
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
              'peer-[&[data-expanded="true"]]:animate-slide-down',
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
