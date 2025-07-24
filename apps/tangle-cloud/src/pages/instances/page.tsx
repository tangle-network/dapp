import { useState } from 'react';
import { AccountStatsCard } from './AccountStatsCard';
import { InstructionCard } from './InstructionCard';
import { TotalValueLockedTabs } from './TotalValueLocked';
import { BlueprintManagementSection } from './BlueprintManagementSection';

const Page = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <>
      <div className="flex justify-between flex-wrap md:flex-nowrap gap-5">
        <AccountStatsCard refreshTrigger={refreshTrigger} />
        <InstructionCard />
      </div>
      <BlueprintManagementSection
        refreshTrigger={refreshTrigger}
        setRefreshTrigger={setRefreshTrigger}
      />
      <TotalValueLockedTabs />
    </>
  );
};

export default Page;
