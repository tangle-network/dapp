import ActiveServicesTable from './ActiveServicesTable';
import ServiceKeyMetrics from './ServiceKeyMetrics';

export default function ServiceOverview() {
  return (
    <div className="my-5 space-y-5">
      {/* Charts */}

      {/* Service Key Metrics */}
      <ServiceKeyMetrics />

      {/* Active Services */}
      <ActiveServicesTable />
    </div>
  );
}
