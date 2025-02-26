import { AccountStatsCard } from './AccountStatsCard';
import { InstructionCard } from './InstructionCard';

const Page = () => {
  return (
    <>
      <div className="flex justify-between flex-wrap md:flex-nowrap gap-5">
        <AccountStatsCard />
        <InstructionCard />
      </div>
    </>
  );
};

export default Page;
