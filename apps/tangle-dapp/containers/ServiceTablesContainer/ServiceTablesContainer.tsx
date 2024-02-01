'use client';

import { TabContent, TableAndChartTabs } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import useSWR from 'swr';

import { ContainerSkeleton, TableStatus } from '../../components';
import { getActiveServices, getPastServices } from '../../data/ServiceTables';
import ServiceTableContainer from './ServiceTableContainer';

interface ServiceTablesContainerProps {
  validatorAddress: string;
}

const pageSize = 10;
const ACTIVE_SERVICES_TAB = 'Active Services';
const PAST_SERVICES_TAB = 'Past Services';

const ServiceTablesContainer: FC<ServiceTablesContainerProps> = ({
  validatorAddress,
}) => {
  const { data: activeServicesData, isLoading: activeServicesDataLoading } =
    useSWR([getActiveServices.name], ([, ...args]) =>
      getActiveServices(...args)
    );

  const { data: pastServicesData, isLoading: pastServicesDataLoading } = useSWR(
    [getPastServices.name],
    ([, ...args]) => getPastServices(...args)
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
            buttonText="Learn More"
            buttonProps={{
              onClick: () => window.open('#', '_blank'),
            }}
            icon="⏳"
          />
        ) : activeServicesDataLoading || !activeServicesData ? (
          <ContainerSkeleton />
        ) : (
          <ServiceTableContainer
            value={activeServicesData}
            pageSize={pageSize}
          />
        )}
      </TabContent>

      <TabContent value={PAST_SERVICES_TAB}>
        {pastServicesData && pastServicesData.length === 0 ? (
          <TableStatus
            title="No Past Services Found"
            description="No ongoing MPC services at the moment. Active services will be listed here."
            buttonText="Learn More"
            buttonProps={{
              onClick: () => window.open('#', '_blank'),
            }}
            icon="⏳"
          />
        ) : pastServicesDataLoading || !pastServicesData ? (
          <ContainerSkeleton />
        ) : (
          <ServiceTableContainer value={pastServicesData} pageSize={pageSize} />
        )}
      </TabContent>
    </TableAndChartTabs>
  );
};

export default ServiceTablesContainer;
