'use client';

import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { ContainerSkeleton, ServiceTable, TableStatus } from '../../components';
import useServiceOverview from '../../data/serviceOverview/useServiceOverview';

const pageSize = 10;

const ActiveServicesTable: FC = () => {
  const { services, isLoading } = useServiceOverview();

  return (
    <div className="space-y-5">
      <Typography variant="h4" fw="bold">
        Active Services
      </Typography>
      {services && services.length === 0 ? (
        <TableStatus
          title="No Active Services Found"
          description="No ongoing MPC services at the moment. Active services will be listed here."
          icon="⏳"
        />
      ) : isLoading || !services ? (
        <ContainerSkeleton />
      ) : (
        <ServiceTable data={services} pageSize={pageSize} />
      )}
    </div>
  );
};

export default ActiveServicesTable;
