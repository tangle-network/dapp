import { useState } from 'react';
import { Button } from '@tangle-network/sandbox-ui/primitives';
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
              <Button variant="ghost" size="sm" asChild>
                <Link to={PagePath.OPERATORS}>View operators</Link>
              </Button>
              <Button variant="sandbox" size="sm" asChild>
                <Link to={PagePath.BLUEPRINTS}>Browse blueprints</Link>
              </Button>
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
        <MetricStrip metrics={globalStats} density="compact" />
      )}
      <TotalValueLockedTabs />
    </div>
  );
};

export default Page;
