import { useState } from 'react';
import { Card, CardVariant } from '@tangle-network/ui-components';
import { Typography } from '@tangle-network/ui-components/typography/Typography/Typography';
import {
  ArrowRightUp,
  GlobalLine,
  GridFillIcon,
  LockFillIcon,
} from '@tangle-network/icons';
import { Link } from 'react-router';
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
            <>
              <Link
                to={PagePath.OPERATORS}
                className="rounded-full px-5 py-2 text-sm font-bold border border-mono-200 text-mono-200 dark:border-mono-0 dark:text-mono-0 hover:border-mono-180 hover:text-mono-180 dark:hover:border-mono-20 dark:hover:text-mono-20 transition-colors"
              >
                View operators
              </Link>
              <Link
                to={PagePath.BLUEPRINTS}
                className="rounded-full px-5 py-2 text-sm font-bold bg-purple-40 text-mono-0 hover:bg-purple-50 dark:bg-purple-50 dark:hover:bg-purple-60 transition-colors"
              >
                Browse blueprints
              </Link>
            </>
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
          {/* Hero banner for disconnected visitors */}
          <div className="relative overflow-hidden rounded-2xl border border-mono-60 dark:border-mono-170 bg-gradient-to-br from-purple-40/10 via-purple-50/5 to-blue-40/10 p-8 md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(155,124,255,0.12),transparent_60%)]" />
            <div className="relative flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-40 to-blue-40 text-2xl text-mono-0 shadow-lg">
                  ◆
                </span>
                <div>
                  <h1 className="font-display text-2xl font-extrabold tracking-tight text-mono-200 dark:text-mono-0 md:text-3xl">
                    Tangle Cloud
                  </h1>
                  <p className="mt-0.5 text-sm text-mono-100 dark:text-mono-80">
                    Decentralized compute for AI, data, and beyond.
                  </p>
                </div>
              </div>
              <p className="max-w-2xl text-base leading-relaxed text-mono-100 dark:text-mono-80">
                Browse the blueprint catalog and operator registry. Connect a
                wallet to deploy services, register capacity, or approve
                requests.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  to={PagePath.BLUEPRINTS}
                  className="rounded-full bg-purple-40 px-6 py-2.5 text-sm font-bold text-mono-0 transition-colors hover:bg-purple-50 dark:bg-purple-50 dark:hover:bg-purple-60"
                >
                  Browse blueprints
                </Link>
                <Link
                  to={PagePath.OPERATORS}
                  className="rounded-full border border-mono-200 px-6 py-2.5 text-sm font-bold text-mono-200 transition-colors hover:border-purple-40 hover:text-purple-40 dark:border-mono-0 dark:text-mono-0 dark:hover:border-purple-40 dark:hover:text-purple-40"
                >
                  View operators
                </Link>
              </div>
            </div>
          </div>

          <MetricStrip metrics={globalStats} density="compact" />

          <div className="grid gap-5 md:grid-cols-3">
            <Card
              variant={CardVariant.GLASS}
              withShadow
              className="flex flex-col gap-3 p-6"
            >
              <GridFillIcon className="h-7 w-7 text-purple-30" />
              <Typography
                variant="h5"
                fw="bold"
                className="text-mono-200 dark:text-mono-0"
              >
                Browse Blueprints
              </Typography>
              <Typography variant="body2" className="text-mono-120">
                Explore AI inference, data, and compute services deployed on
                Tangle Network.
              </Typography>
              <Link
                to={PagePath.BLUEPRINTS}
                className="mt-auto w-fit rounded-full px-5 py-2 text-sm font-bold bg-purple-40 text-mono-0 hover:bg-purple-50 dark:bg-purple-50 dark:hover:bg-purple-60 transition-colors flex items-center gap-1.5"
              >
                View catalog <ArrowRightUp className="h-3.5 w-3.5" />
              </Link>
            </Card>

            <Card
              variant={CardVariant.GLASS}
              withShadow
              className="flex flex-col gap-3 p-6"
            >
              <GlobalLine className="h-7 w-7 text-purple-30" />
              <Typography
                variant="h5"
                fw="bold"
                className="text-mono-200 dark:text-mono-0"
              >
                View Operators
              </Typography>
              <Typography variant="body2" className="text-mono-120">
                See who provides compute capacity, their stake, and which
                blueprints they serve.
              </Typography>
              <Link
                to={PagePath.OPERATORS}
                className="mt-auto w-fit rounded-full px-5 py-2 text-sm font-bold bg-purple-40 text-mono-0 hover:bg-purple-50 dark:bg-purple-50 dark:hover:bg-purple-60 transition-colors flex items-center gap-1.5"
              >
                View operators <ArrowRightUp className="h-3.5 w-3.5" />
              </Link>
            </Card>

            <Card
              variant={CardVariant.GLASS}
              withShadow
              className="flex flex-col gap-3 p-6"
            >
              <LockFillIcon className="h-7 w-7 text-purple-30" />
              <Typography
                variant="h5"
                fw="bold"
                className="text-mono-200 dark:text-mono-0"
              >
                Stake &amp; Earn
              </Typography>
              <Typography variant="body2" className="text-mono-120">
                Delegate TNT to operators, earn rewards, and participate in
                network security.
              </Typography>
              <Link
                to={PagePath.EARNINGS}
                className="mt-auto w-fit rounded-full px-5 py-2 text-sm font-bold bg-purple-40 text-mono-0 hover:bg-purple-50 dark:bg-purple-50 dark:hover:bg-purple-60 transition-colors flex items-center gap-1.5"
              >
                View earnings <ArrowRightUp className="h-3.5 w-3.5" />
              </Link>
            </Card>
          </div>

          {allBlueprints.size > 0 && (
            <>
              <Typography
                variant="h4"
                fw="bold"
                className="text-mono-200 dark:text-mono-0"
              >
                Featured Blueprints
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
            </>
          )}
        </>
      )}

      {isConnected && <TotalValueLockedTabs />}
    </div>
  );
};

export default Page;
