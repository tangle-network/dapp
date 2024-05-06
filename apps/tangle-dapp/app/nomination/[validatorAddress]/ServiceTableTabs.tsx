'use client';

import { TabContent, TableAndChartTabs } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import {
  ContainerSkeleton,
  ServiceTable,
  TableStatus,
} from '../../../components';
import useActiveServicesByValidator from '../../../data/validatorDetails/useActiveServicesByValidator';

interface ServiceTableTabsProps {
  validatorAddress: string;
}

const pageSize = 10;
const ACTIVE_SERVICES_TAB = 'Active Services';
// const PAST_SERVICES_TAB = 'Past Services';

const ServiceTableTabs: FC<ServiceTableTabsProps> = ({ validatorAddress }) => {
  const { services, isLoading } =
    useActiveServicesByValidator(validatorAddress);

  return (
    <TableAndChartTabs
      tabs={[ACTIVE_SERVICES_TAB]}
      headerClassName="w-full overflow-x-auto"
    >
      <TabContent value={ACTIVE_SERVICES_TAB}>
        {isLoading ? (
          <ContainerSkeleton />
        ) : services.length === 0 ? (
          <TableStatus
            title="No Active Services Found for"
            description="This Validator is not participating in any ongoing MPC services at the moment."
            icon="⏳"
          />
        ) : (
          <ServiceTable data={services} pageSize={pageSize} />
        )}
      </TabContent>

      {/* TODO: cannot get past services for now */}
      {/* <TabContent value={PAST_SERVICES_TAB}>
        {services && services.length === 0 ? (
          <TableStatus
            title="No Past Services Found"
            description="No ongoing MPC services at the moment. Active services will be listed here."
            icon="⏳"
          />
        ) : isLoading || !services ? (
          <ContainerSkeleton />
        ) : (
          <ServiceTable data={services} pageSize={pageSize} />
        )}
      </TabContent> */}
    </TableAndChartTabs>
  );
};

export default ServiceTableTabs;
