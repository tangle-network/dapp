import { useState } from 'react';
import { Button } from '@tangle-network/ui-components';
import { Typography } from '@tangle-network/ui-components/typography/Typography/Typography';
import { Link, useNavigate } from 'react-router';
import { useAccount } from 'wagmi';
import { useAllBlueprints } from '@tangle-network/tangle-shared-ui/data/graphql';
import { useAllServices } from '@tangle-network/tangle-shared-ui/data/graphql/useServices';
import { useOperators } from '@tangle-network/tangle-shared-ui/data/graphql/useOperators';
import { AccountStatsCard } from './AccountStatsCard';
import { InstructionCard } from './InstructionCard';
import { TotalValueLockedTabs } from './TotalValueLocked';
import { BlueprintManagementSection } from './BlueprintManagementSection';
import { MetricStrip, PageHeader } from '../../components/chrome';
import type { Metric, MetricTone } from '../../components/chrome';
import useUserStats from '../../data/operators/useUserStats';
import useEvmOperatorInfo from '../../hooks/useEvmOperatorInfo';
import useOperatorStats from '../../data/operators/useOperatorStats';
import { PagePath } from '../../types';

const Page = () => {
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { address, isConnected } = useAccount();
  const { isOperator, operatorAddress } = useEvmOperatorInfo();
  const { result: userStats, isLoading: isLoadingUserStats } = useUserStats(
    address,
    refreshTrigger,
  );
  const { result: operatorStats, isLoading: isLoadingOperatorStats } =
    useOperatorStats(
      isOperator ? (operatorAddress ?? undefined) : undefined,
      refreshTrigger,
    );

  // KPI strip is the prime-real-estate read on this page. The cluster shows
  // role-aware deltas — pending items first (action-required), then steady
  // counts. Disconnected wallets get the catalog/onboarding pitch instead.
  const heroStats: Metric[] = isConnected
    ? operatorStats && operatorStats.registeredBlueprints > 0
      ? [
          {
            label: 'Running services',
            value: operatorStats.runningServices.toLocaleString(),
            loading: isLoadingOperatorStats,
            tone:
              operatorStats.runningServices > 0
                ? ('success' as MetricTone)
                : ('neutral' as MetricTone),
          },
          {
            label: 'Pending approvals',
            value: operatorStats.pendingServices.toLocaleString(),
            loading: isLoadingOperatorStats,
            tone:
              operatorStats.pendingServices > 0
                ? ('warning' as MetricTone)
                : ('neutral' as MetricTone),
            sublabel:
              operatorStats.pendingServices > 0
                ? 'action required'
                : 'no action',
          },
          {
            label: 'Registered blueprints',
            value: operatorStats.registeredBlueprints.toLocaleString(),
            loading: isLoadingOperatorStats,
          },
          {
            label: 'You deployed',
            value: (userStats?.deployedServices ?? 0).toLocaleString(),
            loading: isLoadingUserStats,
          },
        ]
      : [
          {
            label: 'Running services',
            value: (userStats?.runningServices ?? 0).toLocaleString(),
            loading: isLoadingUserStats,
            tone:
              (userStats?.runningServices ?? 0) > 0
                ? ('success' as MetricTone)
                : ('neutral' as MetricTone),
          },
          {
            label: 'Pending requests',
            value: (userStats?.pendingServices ?? 0).toLocaleString(),
            loading: isLoadingUserStats,
            tone:
              (userStats?.pendingServices ?? 0) > 0
                ? ('warning' as MetricTone)
                : ('neutral' as MetricTone),
          },
          {
            label: 'Total deployed',
            value: (userStats?.deployedServices ?? 0).toLocaleString(),
            loading: isLoadingUserStats,
          },
          {
            label: 'Role',
            value: isOperator ? 'Operator' : 'Customer',
          },
        ]
    : [];

  // Global indexer data — works WITHOUT a wallet so visitors see real activity
  const { blueprints: allBlueprints } = useAllBlueprints();
  const { data: allServices } = useAllServices();
  const { data: allOperators } = useOperators({ fallbackToOnChain: false });

  const globalStats: Metric[] = [
    {
      label: 'Blueprints',
      value: allBlueprints.size.toLocaleString(),
      tone: 'neutral' as MetricTone,
    },
    {
      label: 'Services',
      value: (allServices?.length ?? 0).toLocaleString(),
      tone: 'neutral' as MetricTone,
    },
    {
      label: 'Operators',
      value: (allOperators?.length ?? 0).toLocaleString(),
      tone: 'neutral' as MetricTone,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        density="compact"
        title={isConnected ? 'Instances' : 'Tangle Cloud'}
        subtitle={
          isConnected
            ? 'Monitor service instances, operator approvals, job records, and account balances.'
            : 'Browse the blueprint catalog and operator registry. Connect a wallet to deploy services, register capacity, or approve requests.'
        }
        action={
          !isConnected ? (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(PagePath.OPERATORS)}
              >
                View operators
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(PagePath.BLUEPRINTS)}
              >
                Browse blueprints
              </Button>
            </div>
          ) : undefined
        }
      />

      {isConnected ? (
        <>
          {heroStats.length > 0 && (
            <MetricStrip metrics={heroStats} density="compact" />
          )}

          <BlueprintManagementSection
            refreshTrigger={refreshTrigger}
            setRefreshTrigger={setRefreshTrigger}
          />

          <div className="grid gap-5 xl:grid-cols-2 xl:auto-rows-fr xl:items-stretch">
            <AccountStatsCard refreshTrigger={refreshTrigger} />
            <InstructionCard refreshTrigger={refreshTrigger} />
          </div>
        </>
      ) : (
        <>
          <MetricStrip metrics={globalStats} density="compact" />

          {allBlueprints.size > 0 && (
            <>
              <Typography
                variant="h4"
                fw="bold"
                className="text-mono-200 dark:text-mono-0"
              >
                Blueprints
              </Typography>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from(allBlueprints.values())
                  .filter((bp) => bp.name !== 'Onchain Blueprint')
                  .slice(0, 6)
                  .map((bp) => {
                    const cats: Record<string, string> = {
                      inference: 'from-indigo-500/30 to-purple-600/20',
                      data: 'from-emerald-500/30 to-teal-600/20',
                      agent: 'from-amber-500/30 to-orange-600/20',
                      trading: 'from-blue-500/30 to-cyan-600/20',
                      training: 'from-rose-500/30 to-pink-600/20',
                    };
                    const grad =
                      cats[(bp.category ?? '').toLowerCase()] ??
                      'from-purple-500/30 to-violet-600/20';
                    return (
                      <Link
                        key={bp.id.toString()}
                        to={`${PagePath.BLUEPRINTS}/${bp.id.toString()}`}
                        className="group flex flex-col gap-3 overflow-hidden rounded-2xl border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-180 p-5 transition-all duration-200 hover:border-purple-40/40 hover:shadow-[0_8px_40px_rgba(67,62,217,0.12)] dark:hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)] hover:-translate-y-0.5"
                      >
                        <div
                          className={`flex h-10 items-center justify-center rounded-xl bg-gradient-to-br ${grad}`}
                        >
                          <span className="text-sm font-bold uppercase tracking-wider text-mono-0/80">
                            {bp.category ?? 'Blueprint'}
                          </span>
                        </div>
                        <Typography
                          variant="body1"
                          fw="semibold"
                          className="truncate text-mono-200 dark:text-mono-0"
                        >
                          {bp.name ?? 'Unnamed Blueprint'}
                        </Typography>
                        <Typography
                          variant="body2"
                          className="line-clamp-2 min-h-[2.6rem] text-mono-120 dark:text-mono-80"
                        >
                          {bp.description ?? 'No description available'}
                        </Typography>
                        <div className="flex items-center gap-3 pt-1">
                          {bp.operatorsCount !== null &&
                            bp.operatorsCount > 0 && (
                              <span className="flex items-center gap-1 text-xs font-semibold text-mono-100 dark:text-mono-80">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-50" />
                                {bp.operatorsCount} operator
                                {bp.operatorsCount !== 1 ? 's' : ''}
                              </span>
                            )}
                          {bp.instancesCount !== null &&
                            bp.instancesCount > 0 && (
                              <span className="flex items-center gap-1 text-xs font-semibold text-mono-100 dark:text-mono-80">
                                <span className="h-1.5 w-1.5 rounded-full bg-purple-40" />
                                {bp.instancesCount} instance
                                {bp.instancesCount !== 1 ? 's' : ''}
                              </span>
                            )}
                        </div>
                      </Link>
                    );
                  })}
              </div>
              <Link
                to={PagePath.BLUEPRINTS}
                className="inline-flex items-center gap-1 text-sm font-bold text-purple-40 hover:text-purple-30"
              >
                View all blueprints →
              </Link>
            </>
          )}
        </>
      )}

      {isConnected && <TotalValueLockedTabs />}
    </div>
  );
};

export default Page;
