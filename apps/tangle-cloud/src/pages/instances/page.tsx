import { AccountStatsCard } from './AccountStatsCard';
import { InstructionCard } from './InstructionCard';
import { TotalValueLockedTabs } from './TotalValueLocked';
import { BlueprintManagementSection } from './BlueprintManagementSection';
import useRoleStore from '../../stores/roleStore';
import cx from 'classnames';

const Page = () => {
  const isOperator = useRoleStore.getState().isOperator();

  return (
    <>
      <div className="flex justify-between flex-wrap md:flex-nowrap gap-5">
        {isOperator && <AccountStatsCard />}
        <InstructionCard
          rootProps={{
            className: cx({
              '!w-full': !isOperator,
            }),
          }}
        />
      </div>
      <BlueprintManagementSection />
      {isOperator && <TotalValueLockedTabs />}
    </>
  );
};

export default Page;
