import { Spinner } from '@tangle-network/icons';
import {
  InfoIconWithTooltip,
  KeyValueWithButton,
  Typography,
} from '@tangle-network/ui-components';
import { Row } from '@tanstack/react-table';
import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { Account } from '../types';
import { BadgeEnum, BADGE_ICON_RECORD } from '../constants';
import { useAccountActivity } from '../queries';
import { createAccountExplorerUrl } from '../utils/createAccountExplorerUrl';

interface ExpandedInfoProps {
  row: Row<Account>;
}

const ZERO_BIG_INT = BigInt(0);

const ACTIVITY_POINT_INFO: Record<
  BadgeEnum,
  { label: string; description: string; activityKey: keyof Account['activity'] }
> = {
  [BadgeEnum.RESTAKE_DEPOSITOR]: {
    label: 'Deposits',
    description:
      'Points earned from depositing assets into the restaking protocol',
    activityKey: 'depositCount',
  },
  [BadgeEnum.RESTAKE_DELEGATOR]: {
    label: 'Delegations',
    description: 'Points earned from delegating to operators',
    activityKey: 'delegationCount',
  },
  [BadgeEnum.LIQUID_STAKER]: {
    label: 'Liquid Staking',
    description: 'Points earned from liquid vault positions',
    activityKey: 'liquidVaultPositionCount',
  },
  [BadgeEnum.OPERATOR]: {
    label: 'Operator',
    description: 'Points earned from running as a network operator',
    activityKey: 'depositCount', // Operators are tracked separately
  },
  [BadgeEnum.BLUEPRINT_OWNER]: {
    label: 'Blueprints',
    description: 'Points earned from creating and owning blueprints',
    activityKey: 'blueprintCount',
  },
  [BadgeEnum.SERVICE_PROVIDER]: {
    label: 'Services',
    description: 'Points earned from providing services on the network',
    activityKey: 'serviceCount',
  },
  [BadgeEnum.JOB_CALLER]: {
    label: 'Job Calls',
    description: 'Points earned from submitting jobs to services',
    activityKey: 'jobCallCount',
  },
};

const formatPoints = (points: bigint): string => {
  return points.toLocaleString();
};

const ProgressBar = ({
  value,
  max,
  color,
}: {
  value: bigint;
  max: bigint;
  color: 'blue' | 'purple';
}) => {
  const percentage =
    max > ZERO_BIG_INT ? Number((value * BigInt(100)) / max) : 0;
  const colorClass =
    color === 'blue'
      ? 'bg-blue-500 dark:bg-blue-400'
      : 'bg-purple-500 dark:bg-purple-400';

  return (
    <div className="h-2 w-full bg-mono-80 dark:bg-mono-160 rounded-full overflow-hidden">
      <div
        className={twMerge(
          'h-full rounded-full transition-all duration-300',
          colorClass,
        )}
        style={{ width: `${Math.max(percentage, percentage > 0 ? 2 : 0)}%` }}
      />
    </div>
  );
};

const StatCard = ({
  label,
  value,
  subValue,
  color,
  percentage,
  tooltip,
}: {
  label: string;
  value: string;
  subValue?: string;
  color?: 'blue' | 'purple' | 'green';
  percentage?: number;
  tooltip?: string;
}) => {
  const colorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
    green: 'text-green-600 dark:text-green-400',
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <Typography
          variant="body2"
          className="text-mono-120 dark:text-mono-100"
        >
          {label}
        </Typography>
        {tooltip && <InfoIconWithTooltip content={tooltip} />}
      </div>
      <div className="flex items-baseline gap-2">
        <Typography
          variant="h4"
          fw="bold"
          className={twMerge(
            'tabular-nums',
            color ? colorClasses[color] : 'text-mono-200 dark:text-mono-0',
          )}
        >
          {value}
        </Typography>
        {subValue && (
          <Typography
            variant="body2"
            className="text-mono-100 dark:text-mono-120"
          >
            {subValue}
          </Typography>
        )}
        {percentage !== undefined && (
          <Typography
            variant="body2"
            className="text-mono-100 dark:text-mono-120"
          >
            ({percentage}%)
          </Typography>
        )}
      </div>
    </div>
  );
};

const ActivityBadge = ({
  badge,
  count,
  isActive,
}: {
  badge: BadgeEnum;
  count: number;
  isActive: boolean;
}) => {
  const info = ACTIVITY_POINT_INFO[badge];

  return (
    <div
      className={twMerge(
        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
        isActive
          ? 'bg-green-500/10 dark:bg-green-500/20 border border-green-500/30'
          : 'bg-mono-40 dark:bg-mono-180 border border-transparent',
      )}
    >
      <span className="text-lg">{BADGE_ICON_RECORD[badge]}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Typography
            variant="body2"
            fw="bold"
            className={twMerge(
              isActive
                ? 'text-green-700 dark:text-green-400'
                : 'text-mono-140 dark:text-mono-80',
            )}
          >
            {info.label}
          </Typography>
          <InfoIconWithTooltip content={info.description} />
        </div>
        <Typography
          variant="body2"
          className="text-mono-100 dark:text-mono-120"
        >
          {count} {count === 1 ? 'activity' : 'activities'}
        </Typography>
      </div>
      {isActive && (
        <div className="px-2 py-0.5 rounded bg-green-500/20 dark:bg-green-500/30">
          <Typography
            variant="body3"
            fw="bold"
            className="text-green-700 dark:text-green-400 uppercase text-[10px]"
          >
            Active
          </Typography>
        </div>
      )}
    </div>
  );
};

const CompactActivityBadge = ({
  badge,
  isActive,
}: {
  badge: BadgeEnum;
  isActive: boolean;
}) => {
  return (
    <div
      className={twMerge(
        'flex items-center justify-center w-8 h-8 rounded-full text-base',
        isActive
          ? 'bg-green-500/20 dark:bg-green-500/30 ring-1 ring-green-500/50'
          : 'bg-mono-40 dark:bg-mono-170',
      )}
      title={ACTIVITY_POINT_INFO[badge].label}
    >
      {BADGE_ICON_RECORD[badge]}
    </div>
  );
};

const safeBigInt = (value: string | undefined | null): bigint => {
  if (!value) return ZERO_BIG_INT;
  try {
    return BigInt(value);
  } catch {
    return ZERO_BIG_INT;
  }
};

export const ExpandedInfo: React.FC<ExpandedInfoProps> = ({ row }) => {
  const account = row.original;
  const address = account.id;
  const accountNetwork = account.network;

  // Fetch activity data for this account
  const { data: activityData, isPending: isLoadingActivity } =
    useAccountActivity(accountNetwork, address);

  const { mainnetPercentage, testnetPercentage, totalPoints } = useMemo(() => {
    const total = account.totalPoints;
    const mainnet = account.pointsBreakdown.mainnet;
    const testnet = account.pointsBreakdown.testnet;

    if (total === ZERO_BIG_INT) {
      return { mainnetPercentage: 0, testnetPercentage: 0, totalPoints: total };
    }

    return {
      mainnetPercentage: Math.round(Number((mainnet * BigInt(100)) / total)),
      testnetPercentage: Math.round(Number((testnet * BigInt(100)) / total)),
      totalPoints: total,
    };
  }, [account.totalPoints, account.pointsBreakdown]);

  // Calculate activity counts from fetched data
  const activityCounts = useMemo(() => {
    if (!activityData) {
      return {
        depositCount: 0,
        delegationCount: 0,
        liquidVaultPositionCount: 0,
        blueprintCount: 0,
        serviceCount: 0,
        jobCallCount: 0,
        isOperator: false,
      };
    }

    const delegator = activityData.Delegator_by_pk;

    return {
      depositCount:
        delegator?.assetPositions?.filter(
          (pos) => safeBigInt(pos.totalDeposited) > ZERO_BIG_INT,
        ).length ?? 0,
      delegationCount:
        delegator?.delegations?.filter(
          (del) => safeBigInt(del.shares) > ZERO_BIG_INT,
        ).length ?? 0,
      liquidVaultPositionCount:
        delegator?.liquidVaultPositions?.filter(
          (pos) => safeBigInt(pos.shares) > ZERO_BIG_INT,
        ).length ?? 0,
      blueprintCount: activityData.Blueprint?.length ?? 0,
      serviceCount: activityData.Service?.length ?? 0,
      jobCallCount: activityData.JobCall?.length ?? 0,
      isOperator: (activityData.Operator?.length ?? 0) > 0,
    };
  }, [activityData]);

  // Calculate badges based on activity
  const earnedBadges = useMemo(() => {
    const badges: BadgeEnum[] = [];

    if (activityCounts.depositCount > 0) {
      badges.push(BadgeEnum.RESTAKE_DEPOSITOR);
    }
    if (activityCounts.delegationCount > 0) {
      badges.push(BadgeEnum.RESTAKE_DELEGATOR);
    }
    if (activityCounts.liquidVaultPositionCount > 0) {
      badges.push(BadgeEnum.LIQUID_STAKER);
    }
    if (activityCounts.isOperator) {
      badges.push(BadgeEnum.OPERATOR);
    }
    if (activityCounts.blueprintCount > 0) {
      badges.push(BadgeEnum.BLUEPRINT_OWNER);
    }
    if (activityCounts.serviceCount > 0) {
      badges.push(BadgeEnum.SERVICE_PROVIDER);
    }
    if (activityCounts.jobCallCount > 0) {
      badges.push(BadgeEnum.JOB_CALLER);
    }

    return badges;
  }, [activityCounts]);

  const activityBadges = useMemo(() => {
    const badges = Object.values(BadgeEnum);
    return badges.map((badge) => {
      const info = ACTIVITY_POINT_INFO[badge];
      let count = 0;

      switch (badge) {
        case BadgeEnum.RESTAKE_DEPOSITOR:
          count = activityCounts.depositCount;
          break;
        case BadgeEnum.RESTAKE_DELEGATOR:
          count = activityCounts.delegationCount;
          break;
        case BadgeEnum.LIQUID_STAKER:
          count = activityCounts.liquidVaultPositionCount;
          break;
        case BadgeEnum.OPERATOR:
          count = activityCounts.isOperator ? 1 : 0;
          break;
        case BadgeEnum.BLUEPRINT_OWNER:
          count = activityCounts.blueprintCount;
          break;
        case BadgeEnum.SERVICE_PROVIDER:
          count = activityCounts.serviceCount;
          break;
        case BadgeEnum.JOB_CALLER:
          count = activityCounts.jobCallCount;
          break;
      }

      const isActive = earnedBadges.includes(badge);
      return { badge, count, isActive, info };
    });
  }, [activityCounts, earnedBadges]);

  const totalActivityCount = useMemo(() => {
    return (
      activityCounts.depositCount +
      activityCounts.delegationCount +
      activityCounts.liquidVaultPositionCount +
      activityCounts.blueprintCount +
      activityCounts.serviceCount +
      activityCounts.jobCallCount
    );
  }, [activityCounts]);

  return (
    <div className="px-2 sm:px-4 pb-4">
      {/* Mobile Layout - Compact Single Column */}
      <div className="block md:hidden overflow-hidden">
        <div className="rounded-xl bg-mono-20 dark:bg-mono-180 border border-mono-60 dark:border-mono-160 p-3 space-y-3">
          {/* Header with Address and Explorer Link */}
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0 flex-1">
              <KeyValueWithButton size="sm" keyValue={address} />
            </div>
            <a
              href={createAccountExplorerUrl(address, accountNetwork)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-xs whitespace-nowrap flex-shrink-0"
            >
              Explorer
            </a>
          </div>

          {/* Points Summary Row */}
          <div className="grid grid-cols-3 gap-1 py-2 border-y border-mono-60 dark:border-mono-160">
            <div className="text-center min-w-0">
              <Typography
                variant="body1"
                fw="bold"
                className="text-mono-200 dark:text-mono-0 tabular-nums truncate"
              >
                {formatPoints(totalPoints)}
              </Typography>
              <Typography
                variant="body3"
                className="text-mono-100 dark:text-mono-120"
              >
                Total
              </Typography>
            </div>
            <div className="text-center border-x border-mono-60 dark:border-mono-160 min-w-0 px-1">
              <Typography
                variant="body1"
                fw="bold"
                className="text-blue-600 dark:text-blue-400 tabular-nums truncate"
              >
                {formatPoints(account.pointsBreakdown.mainnet)}
              </Typography>
              <Typography
                variant="body3"
                className="text-mono-100 dark:text-mono-120"
              >
                Mainnet
              </Typography>
            </div>
            <div className="text-center min-w-0">
              <Typography
                variant="body1"
                fw="bold"
                className="text-purple-600 dark:text-purple-400 tabular-nums truncate"
              >
                {formatPoints(account.pointsBreakdown.testnet)}
              </Typography>
              <Typography
                variant="body3"
                className="text-mono-100 dark:text-mono-120"
              >
                Testnet
              </Typography>
            </div>
          </div>

          {/* 7-Day Change */}
          <div className="flex items-center justify-between">
            <Typography
              variant="body2"
              className="text-mono-100 dark:text-mono-120"
            >
              Last 7 days
            </Typography>
            <Typography
              variant="body2"
              fw="bold"
              className="text-green-600 dark:text-green-400"
            >
              +{formatPoints(account.pointsBreakdown.lastSevenDays)}
            </Typography>
          </div>

          {/* Activity Badges - Emoji Only */}
          <div className="pt-2 border-t border-mono-60 dark:border-mono-160">
            <div className="flex items-center justify-between mb-2">
              <Typography
                variant="body2"
                fw="bold"
                className="text-mono-200 dark:text-mono-0"
              >
                Activities
              </Typography>
              {isLoadingActivity ? (
                <Spinner size="md" />
              ) : (
                <Typography
                  variant="body3"
                  className="text-mono-100 dark:text-mono-120"
                >
                  {earnedBadges.length} badge
                  {earnedBadges.length !== 1 ? 's' : ''}
                </Typography>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {activityBadges.map(({ badge, isActive }) => (
                <CompactActivityBadge
                  key={badge}
                  badge={badge}
                  isActive={isActive}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - 3 Column Grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Account Overview Card */}
        <div className="rounded-xl bg-mono-20 dark:bg-mono-180 border border-mono-60 dark:border-mono-160 p-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Typography
                variant="h5"
                fw="bold"
                className="text-mono-200 dark:text-mono-0"
              >
                Account
              </Typography>
              <a
                href={createAccountExplorerUrl(address, accountNetwork)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
              >
                View on Explorer
              </a>
            </div>

            <KeyValueWithButton size="sm" keyValue={address} />

            <div className="pt-2 border-t border-mono-60 dark:border-mono-160">
              <StatCard
                label="Total Points"
                value={formatPoints(totalPoints)}
                tooltip="Total experience points earned across all networks and activities"
              />
            </div>

            {account.updatedAtTimestamp && (
              <div className="pt-2 border-t border-mono-60 dark:border-mono-160">
                <Typography
                  variant="body2"
                  className="text-mono-100 dark:text-mono-120"
                >
                  Last updated:{' '}
                  {account.updatedAtTimestamp.toLocaleDateString()}
                </Typography>
              </div>
            )}
          </div>
        </div>

        {/* Points Breakdown Card */}
        <div className="rounded-xl bg-mono-20 dark:bg-mono-180 border border-mono-60 dark:border-mono-160 p-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Typography
                variant="h5"
                fw="bold"
                className="text-mono-200 dark:text-mono-0"
              >
                Points by Network
              </Typography>
              <InfoIconWithTooltip content="Points are earned from activities on different networks. Mainnet activities typically earn more points." />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <StatCard
                    label="Mainnet"
                    value={formatPoints(account.pointsBreakdown.mainnet)}
                    color="blue"
                    percentage={mainnetPercentage}
                  />
                </div>
                <ProgressBar
                  value={account.pointsBreakdown.mainnet}
                  max={totalPoints}
                  color="blue"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <StatCard
                    label="Testnet"
                    value={formatPoints(account.pointsBreakdown.testnet)}
                    color="purple"
                    percentage={testnetPercentage}
                  />
                </div>
                <ProgressBar
                  value={account.pointsBreakdown.testnet}
                  max={totalPoints}
                  color="purple"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-mono-60 dark:border-mono-160">
              <StatCard
                label="Last 7 Days"
                value={`+${formatPoints(account.pointsBreakdown.lastSevenDays)}`}
                color="green"
                tooltip="Points earned in the last 7 days"
              />
            </div>
          </div>
        </div>

        {/* Activity & Badges Card */}
        <div className="rounded-xl bg-mono-20 dark:bg-mono-180 border border-mono-60 dark:border-mono-160 p-5 md:col-span-2 lg:col-span-1">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Typography
                  variant="h5"
                  fw="bold"
                  className="text-mono-200 dark:text-mono-0"
                >
                  Activities
                </Typography>
                <InfoIconWithTooltip content="Activities that contribute to earning points. Green badges indicate active participation in that category." />
              </div>
              {isLoadingActivity ? (
                <Spinner size="md" />
              ) : (
                <Typography
                  variant="body2"
                  className="text-mono-100 dark:text-mono-120"
                >
                  {earnedBadges.length} badge
                  {earnedBadges.length !== 1 ? 's' : ''} earned
                </Typography>
              )}
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {activityBadges.map(({ badge, count, isActive }) => (
                <ActivityBadge
                  key={badge}
                  badge={badge}
                  count={count}
                  isActive={isActive}
                />
              ))}
            </div>

            <div className="pt-2 border-t border-mono-60 dark:border-mono-160">
              <Typography
                variant="body2"
                className="text-mono-100 dark:text-mono-120"
              >
                {totalActivityCount} total activities across all categories
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
