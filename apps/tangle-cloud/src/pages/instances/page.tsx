import { AccountStatsCard } from './AccountStatsCard';
import { InstructionCard } from './InstructionCard';
import { RegisteredBlueprintsTabs } from './RegisteredBlueprints';
import { InstancesTabs } from './Instances';
import { TotalValueLockedTabs } from './TotalValueLocked';

const Page = () => {
  return (
    <>
      <div className="flex justify-between flex-wrap md:flex-nowrap gap-5">
        <AccountStatsCard />
        <InstructionCard />
      </div>
      <RegisteredBlueprintsTabs />
      <InstancesTabs />
      <TotalValueLockedTabs />
    </>
  );
};

export default Page;
