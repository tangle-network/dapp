import { FC } from 'react';
import useSWR from 'swr';

import SkeletonRow from '../../../components/skeleton/SkeletonRow';
import TableStatus from '../../../components/TableStatus/TableStatus';
import getPastJobs from '../../../data/JobTables/getPastJobs';
import JobsTableClient from './JobsTableClient';
import { JobsTableProps } from './types';

const PastJobsTable: FC<JobsTableProps> = ({ pageSize }) => {
  const { data, isLoading } = useSWR([getPastJobs.name], ([, ...args]) =>
    getPastJobs(...args)
  );

  if (isLoading || !data) {
    return <SkeletonRow />;
  }

  if (data && data.length === 0) {
    return (
      <TableStatus
        title="No Past Job Found"
        description="No ongoing MPC jobs at the moment. Past jobs will be listed here."
        icon="⏳"
      />
    );
  }

  return <JobsTableClient data={data} pageSize={pageSize} />;
};

export default PastJobsTable;
