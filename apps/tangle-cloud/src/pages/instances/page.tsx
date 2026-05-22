import { useState } from 'react';
import { Card, CardContent } from '@tangle-network/sandbox-ui/primitives';
import { AccountStatsCard } from './AccountStatsCard';
import { InstructionCard } from './InstructionCard';
import { TotalValueLockedTabs } from './TotalValueLocked';
import { BlueprintManagementSection } from './BlueprintManagementSection';

const Page = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="space-y-6">
      <Card
        variant="sandbox"
        className="cloud-hero-card cloud-compact-header overflow-hidden"
      >
        <CardContent className="relative p-4 md:p-5">
          <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_12%_8%,rgba(99,102,241,0.18),transparent_32%),radial-gradient(circle_at_86%_12%,rgba(16,185,129,0.10),transparent_28%)]" />
          <div className="relative">
            <h1 className="font-display font-extrabold text-3xl text-foreground leading-[1.05] tracking-[-0.035em] sm:text-4xl">
              Instances
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground text-sm leading-relaxed">
              Monitor service instances, operator approvals, job records, and
              account balances.
            </p>
          </div>
        </CardContent>
      </Card>

      <BlueprintManagementSection
        refreshTrigger={refreshTrigger}
        setRefreshTrigger={setRefreshTrigger}
      />

      <div className="grid gap-5 xl:grid-cols-2 xl:auto-rows-fr xl:items-stretch">
        <AccountStatsCard refreshTrigger={refreshTrigger} />
        <InstructionCard />
      </div>
      <TotalValueLockedTabs />
    </div>
  );
};

export default Page;
