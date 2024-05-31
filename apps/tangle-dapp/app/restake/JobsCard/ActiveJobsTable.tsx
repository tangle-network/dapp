'use client';

import { FC } from 'react';
import useSWR from 'swr';

import SkeletonRow from '../../../components/skeleton/SkeletonRow';
import TableStatus from '../../../components/TableStatus/TableStatus';
import getActiveJobs from '../../../data/JobTables/getActiveJobs';
import JobsTableClient from './JobsTableClient';
import { JobsTableProps } from './types';

const ActiveJobsTable: FC<JobsTableProps> = ({ pageSize }) => {
  const { data, isLoading } = useSWR([getActiveJobs.name], ([, ...args]) =>
    getActiveJobs(...args),
  );

  if (isLoading || !data) {
    return <SkeletonRow />;
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
