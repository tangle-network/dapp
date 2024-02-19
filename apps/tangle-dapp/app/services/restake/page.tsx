import JobsCard from './JobsCard';
import OverviewCard from './OverviewCard';
import RoleDistributionCard from './RoleDistributionCard';
import RolesEarningsCard from './RolesEarningsCard';

const RestakePage = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-6 md:flex-row">
        <OverviewCard />

        <RoleDistributionCard />
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        <RolesEarningsCard />

        <JobsCard />
      </div>
    </div>
  );
};

export default RestakePage;
