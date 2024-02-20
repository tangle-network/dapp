import JobsCard from './JobsCard';
import OverviewCard from './OverviewCard';
import RoleDistributionCard from './RoleDistributionCard';
import RolesEarningsCard from './RolesEarningsCard';

const RestakePage = () => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 justify-items-stretch">
      <OverviewCard />

      <RoleDistributionCard />

      <RolesEarningsCard />

      <JobsCard />
    </div>
  );
};

export default RestakePage;
