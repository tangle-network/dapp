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
                  .slice(0, 6)
                  .map((bp) => (
                    <Card
                      key={bp.id.toString()}
                      variant={CardVariant.GLASS}
                      withShadow
                      className="flex flex-col gap-2 p-5"
                    >
                      <Typography
                        variant="body1"
                        fw="semibold"
                        className="text-mono-200 dark:text-mono-0"
                      >
                        {bp.name ?? 'Unnamed Blueprint'}
                      </Typography>
                      <Typography
                        variant="body2"
                        className="line-clamp-2 text-mono-120"
                      >
                        {bp.description ?? 'No description available'}
                      </Typography>
                      <Link
                        to={`${PagePath.BLUEPRINTS}/${bp.id.toString()}`}
                        className="mt-auto pt-2 text-sm font-medium text-purple-40 hover:text-purple-30"
                      >
                        View details
                      </Link>
                    </Card>
                  ))}
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
