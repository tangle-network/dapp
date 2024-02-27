import ActiveServicesTable from './ActiveServicesTable';
import ProtocolEarningsCard from './ProtocolEarningsCard';
import RoleDistributionCard from './RoleDistributionCard';
import ServiceKeyMetrics from './ServiceKeyMetrics';

export default function ServiceOverview() {
  return (
    <div className="my-5 space-y-5">
      {/* Charts */}
      <div className="flex flex-col lg:flex-row gap-5 lg:items-stretch">
        <RoleDistributionCard className="flex-1" />
        <ProtocolEarningsCard className="flex-1" />
        <div className="flex-1">What is Restaking?</div>
      </div>

      {/* Service Key Metrics */}
      <ServiceKeyMetrics />

      {/* Active Services */}
      <ActiveServicesTable />
    </div>
  );
}
