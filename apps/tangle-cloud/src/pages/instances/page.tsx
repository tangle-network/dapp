import { AccountStatsCard } from './AccountStatsCard';
import { InstructionCard } from './InstructionCard';
import { RegisteredBlueprintsTabs } from './registeredBlueprints';
import { InstancesTabs } from './instances';

const Page = () => {
  return (
    <>
      <div className="flex justify-between flex-wrap md:flex-nowrap gap-5">
        <AccountStatsCard />
        <InstructionCard />
      </div>
      <RegisteredBlueprintsTabs />
      <InstancesTabs />
    </>
  );
};

export default Page;
