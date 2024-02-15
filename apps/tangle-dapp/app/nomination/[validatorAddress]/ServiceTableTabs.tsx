'use client';

import { TabContent, TableAndChartTabs } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import useSWR from 'swr';

import {
  ContainerSkeleton,
  ServiceTable,
  TableStatus,
} from '../../../components';
import {
  getActiveServicesByValidator,
  getPastServicesByValidator,
} from '../../../data/ServiceTables';

interface ServiceTableTabsProps {
  validatorAddress: string;
}

const pageSize = 10;
const ACTIVE_SERVICES_TAB = 'Active Services';
const PAST_SERVICES_TAB = 'Past Services';

const ServiceTableTabs: FC<ServiceTableTabsProps> = () => {
  const { data: activeServicesData, isLoading: activeServicesDataLoading } =
    useSWR([getActiveServicesByValidator.name], ([, ...args]) =>
      getActiveServicesByValidator(...args)
    );

  const { data: pastServicesData, isLoading: pastServicesDataLoading } = useSWR(
    [getPastServicesByValidator.name],
    ([, ...args]) => getPastServicesByValidator(...args)
  );

  return (
    <TableAndChartTabs
      tabs={[ACTIVE_SERVICES_TAB, PAST_SERVICES_TAB]}
      headerClassName="w-full overflow-x-auto"
    >
      <TabContent value={ACTIVE_SERVICES_TAB}>
        {activeServicesData && activeServicesData.length === 0 ? (
          <TableStatus
            title="No Active Services Found"
            description="No ongoing MPC services at the moment. Active services will be listed here."
            icon="⏳"
          />
        ) : activeServicesDataLoading || !activeServicesData ? (
          <ContainerSkeleton />
        ) : (
          <ServiceTable data={activeServicesData} pageSize={pageSize} />
        )}
      </TabContent>

      <TabContent value={PAST_SERVICES_TAB}>
        {pastServicesData && pastServicesData.length === 0 ? (
          <TableStatus
            title="No Past Services Found"
            description="No ongoing MPC services at the moment. Active services will be listed here."
            icon="⏳"
          />
        ) : pastServicesDataLoading || !pastServicesData ? (
          <ContainerSkeleton />
        ) : (
          <ServiceTable data={pastServicesData} pageSize={pageSize} />
        )}
      </TabContent>
    </TableAndChartTabs>
  );
};

export default ServiceTableTabs;
