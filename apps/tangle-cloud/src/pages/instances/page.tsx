import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
} from '@tangle-network/sandbox-ui/primitives';
import { Link } from 'react-router';
import { useAccount } from 'wagmi';
import { AccountStatsCard } from './AccountStatsCard';
import { InstructionCard } from './InstructionCard';
import { TotalValueLockedTabs } from './TotalValueLocked';
import { BlueprintManagementSection } from './BlueprintManagementSection';
import { StatRow } from '../../components/stats/Stat';
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
  const heroStats = isConnected
    ? operatorStats && operatorStats.registeredBlueprints > 0
      ? [
          {
            label: 'Running services',
            value: operatorStats.runningServices,
            isLoading: isLoadingOperatorStats,
            tone:
              operatorStats.runningServices > 0
                ? ('success' as const)
                : ('default' as const),
          },
          {
            label: 'Pending approvals',
            value: operatorStats.pendingServices,
            isLoading: isLoadingOperatorStats,
            tone:
              operatorStats.pendingServices > 0
                ? ('warning' as const)
                : ('default' as const),
            sublabel:
              operatorStats.pendingServices > 0
                ? 'Action required'
                : 'No action needed',
          },
          {
            label: 'Registered blueprints',
            value: operatorStats.registeredBlueprints,
            isLoading: isLoadingOperatorStats,
          },
          {
            label: 'You deployed',
            value: userStats?.deployedServices ?? 0,
            isLoading: isLoadingUserStats,
          },
        ]
      : [
          {
            label: 'Running services',
            value: userStats?.runningServices ?? 0,
            isLoading: isLoadingUserStats,
            tone:
              (userStats?.runningServices ?? 0) > 0
                ? ('success' as const)
                : ('default' as const),
          },
          {
            label: 'Pending requests',
            value: userStats?.pendingServices ?? 0,
            isLoading: isLoadingUserStats,
            tone:
              (userStats?.pendingServices ?? 0) > 0
                ? ('warning' as const)
                : ('default' as const),
          },
          {
            label: 'Total deployed',
            value: userStats?.deployedServices ?? 0,
            isLoading: isLoadingUserStats,
          },
          {
            label: 'Role',
            value: isOperator ? 'Operator' : 'Customer',
          },
        ]
    : [];

  return (
    <div className="space-y-6">
      <Card
        variant="sandbox"
        className="cloud-hero-card cloud-compact-header overflow-hidden"
      >
        <CardContent className="relative p-4 md:p-5">
          <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_12%_8%,rgba(99,102,241,0.18),transparent_32%),radial-gradient(circle_at_86%_12%,rgba(16,185,129,0.10),transparent_28%)]" />
          <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(420px,520px)] xl:items-center">
            <div>
              <h1 className="font-display font-extrabold text-3xl text-foreground leading-[1.05] tracking-[-0.035em] sm:text-4xl">
                {isConnected ? 'Instances' : 'Tangle Cloud'}
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground text-sm leading-relaxed">
                {isConnected
                  ? 'Monitor service instances, operator approvals, job records, and account balances.'
                  : 'Browse the blueprint catalog and operator registry. Connect a wallet to deploy services, register capacity, or approve requests.'}
              </p>
              {!isConnected && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="sandbox" asChild>
                    <Link to={PagePath.BLUEPRINTS}>Browse blueprints</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to={PagePath.OPERATORS}>View operators</Link>
                  </Button>
                </div>
              )}
            </div>

            {isConnected && heroStats.length > 0 && (
              <StatRow
                items={heroStats}
                className="rounded-lg border border-border bg-[var(--bg-elevated)] p-3 shadow-[var(--shadow-card)]"
              />
            )}
          </div>
        </CardContent>
      </Card>

      <BlueprintManagementSection
        refreshTrigger={refreshTrigger}
        setRefreshTrigger={setRefreshTrigger}
      />

      <div className="grid gap-5 xl:grid-cols-2 xl:auto-rows-fr xl:items-stretch">
        <AccountStatsCard refreshTrigger={refreshTrigger} />
        <InstructionCard refreshTrigger={refreshTrigger} />
      </div>
      <TotalValueLockedTabs />
    </div>
  );
};

export default Page;
