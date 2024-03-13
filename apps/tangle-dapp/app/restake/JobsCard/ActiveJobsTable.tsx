'use client';

import { FC } from 'react';
import useSWR from 'swr';

import ContainerSkeleton from '../../../components/skeleton/ContainerSkeleton';
import TableStatus from '../../../components/TableStatus/TableStatus';
import getActiveJobs from '../../../data/JobTables/getActiveJobs';
import JobsTableClient from './JobsTableClient';
import { JobsTableProps } from './types';

const ActiveJobsTable: FC<JobsTableProps> = ({ pageSize }) => {
  const { data, isLoading } = useSWR([getActiveJobs.name], ([, ...args]) =>
    getActiveJobs(...args)
  );

  if (isLoading || !data) {
    return <ContainerSkeleton className="border-0" />;
  }

  if (data && data.length === 0) {
    return (
      <TableStatus
        title="No Active Job Found"
        description="No ongoing MPC jobs at the moment. Active jobs will be listed here."
        icon="⏳"
      />
    );
  }

  return <JobsTableClient data={data} pageSize={pageSize} />;
};

export default ActiveJobsTable;
