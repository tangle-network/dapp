import { useState } from 'react';
import { Card, CardContent } from '@tangle-network/sandbox-ui/primitives';
import { AccountStatsCard } from './AccountStatsCard';
import { InstructionCard } from './InstructionCard';
import { TotalValueLockedTabs } from './TotalValueLocked';
import { BlueprintManagementSection } from './BlueprintManagementSection';

const Page = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="space-y-8">
      <Card
        variant="sandbox"
        className="overflow-hidden border-border bg-card shadow-[var(--shadow-card)]"
      >
        <CardContent className="relative p-6 md:p-8">
          <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_12%_8%,rgba(99,102,241,0.18),transparent_32%),radial-gradient(circle_at_86%_12%,rgba(16,185,129,0.10),transparent_28%)]" />
          <div className="relative">
            <h1 className="font-display font-extrabold text-4xl text-foreground leading-[0.92] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
              Instances
            </h1>
            <p className="mt-5 max-w-2xl text-muted-foreground text-sm leading-relaxed sm:text-base">
              Monitor service instances, operator approvals, job records, and
              account balances.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between flex-wrap md:flex-nowrap gap-5">
        <AccountStatsCard refreshTrigger={refreshTrigger} />
        <InstructionCard />
      </div>
      <BlueprintManagementSection
        refreshTrigger={refreshTrigger}
        setRefreshTrigger={setRefreshTrigger}
      />
      <TotalValueLockedTabs />
    </div>
  );
};

export default Page;
