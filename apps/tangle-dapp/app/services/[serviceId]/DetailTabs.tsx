'use client';

import { TabContent, TableAndChartTabs } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

// import JobsListTable from './JobsListTable';
import PermittedCaller from './PermittedCaller';

interface DetailTabsProps {
  serviceId: string;
  className?: string;
}

// const JOBS_LIST_TAB = 'Jobs List';
const PERMITTED_CALLER_TAB = 'Permitted Caller';

const DetailTabs: FC<DetailTabsProps> = ({ serviceId, className }) => {
  return (
    <TableAndChartTabs
      tabs={[PERMITTED_CALLER_TAB]}
      triggerTypographyVariant="h4"
      className={twMerge('flex flex-col gap-5 space-y-0', className)}
    >
      {/* <TabContent value={JOBS_LIST_TAB} className="flex-1">
        <JobsListTable serviceId={serviceId} />
      </TabContent> */}
      <TabContent value={PERMITTED_CALLER_TAB} className="flex-1">
        <PermittedCaller serviceId={serviceId} />
      </TabContent>
    </TableAndChartTabs>
  );
};

export default DetailTabs;
