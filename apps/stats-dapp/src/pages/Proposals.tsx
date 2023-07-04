import { useStatsContext } from '../provider/stats-provider';
import {
  Card,
  Stats,
  TitleWithInfo,
} from '@webb-tools/webb-ui-components/components';
import React, { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { ProposalsTable } from '../containers';
import { useProposalThreshold } from '../provider/hooks';
import { StackedAreaChartContainer } from '../containers/StackedAreaChartContainer';

const Proposals = () => {
  const {
    metaData: { activeSession },
  } = useStatsContext();

  const proposalsThreshold = useProposalThreshold(activeSession);

  const statsItems = useMemo<
    React.ComponentProps<typeof Stats>['items']
  >(() => {
    const threshold = proposalsThreshold.val?.threshold.toString() ?? '0';

    const proposers = proposalsThreshold.val?.total.toString() ?? '0';

    return [
      {
        titleProps: {
          title: 'Proposal Threshold',
          info: 'Proposal Threshold',
        },
        value: threshold,
      },
      {
        titleProps: {
          title: 'Proposers',
          info: 'Proposers',
        },
        value: proposers,
      },
    ];
  }, [proposalsThreshold]);

  return (
    <div className="flex flex-col space-y-4">
      <Card>
        <TitleWithInfo
          title="Proposals Status"
          variant="h5"
          info="Proposals Status"
        />

        <Stats items={statsItems} />
      </Card>

      <StackedAreaChartContainer />

      <ProposalsTable />

      <Outlet />
    </div>
  );
};

export default Proposals;
