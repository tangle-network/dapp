'use client';

import { TableAndChartTabs } from '@webb-tools/webb-ui-components/components/TableAndChartTabs';
import { TabContent } from '@webb-tools/webb-ui-components/components/Tabs/TabContent';

import GlassCard from '../../../components/GlassCard/GlassCard';
import ActiveJobsTable from './ActiveJobsTable';
import PastJobsTable from './PastJobsTable';

const ACTIVE_JOBS_TAB = 'Active Jobs';
const PAST_JOBS_TAB = 'Past Jobs';

const PAGE_SIZE = 5;

const JobsCard = () => {
  return (
    <GlassCard>
      <TableAndChartTabs
        tabs={[ACTIVE_JOBS_TAB, PAST_JOBS_TAB]}
        headerClassName="w-full overflow-x-auto"
      >
        <TabContent value={ACTIVE_JOBS_TAB}>
          <ActiveJobsTable pageSize={PAGE_SIZE} />
        </TabContent>

        <TabContent value={PAST_JOBS_TAB}>
          <PastJobsTable pageSize={PAGE_SIZE} />
        </TabContent>
      </TableAndChartTabs>
    </GlassCard>
  );
};

export default JobsCard;
