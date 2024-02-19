'use client';

import { TabContent, TableAndChartTabs } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import JobsListTable from './JobsListTable';
import SigningRules from './SigningRules';

interface DetailTabsProps {
  serviceId: string;
  className?: string;
}

const JOBS_LIST_TAB = 'Jobs List';
const SIGNING_RULES_TAB = 'Signing Rules';

const DetailTabs: FC<DetailTabsProps> = ({ serviceId, className }) => {
  return (
    <TableAndChartTabs
      tabs={[JOBS_LIST_TAB, SIGNING_RULES_TAB]}
      triggerTypographyVariant="h4"
      className={twMerge('flex flex-col gap-5 space-y-0', className)}
    >
      <TabContent value={JOBS_LIST_TAB} className="flex-1">
        <JobsListTable serviceId={serviceId} />
      </TabContent>
      <TabContent value={SIGNING_RULES_TAB} className="flex-1">
        <SigningRules />
      </TabContent>
    </TableAndChartTabs>
  );
};

export default DetailTabs;
