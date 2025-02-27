import { RegisteredBlueprintsTabs } from './RegisteredBlueprints';
import { AccountStatsCard } from './AccountStatsCard';
import { InstructionCard } from './InstructionCard';

const Page = () => {
  return (
    <>
      <div className="flex justify-between flex-wrap md:flex-nowrap gap-5">
        <AccountStatsCard />
        <InstructionCard />
      </div>
      <RegisteredBlueprintsTabs />
    </>
  );
};

export default Page;
