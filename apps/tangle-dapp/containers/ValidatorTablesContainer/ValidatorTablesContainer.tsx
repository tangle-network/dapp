'use client';

import { TabContent, TableAndChartTabs } from '@webb-tools/webb-ui-components';
import { TANGLE_STAKING_URL } from '@webb-tools/webb-ui-components/constants';
import useSWR from 'swr';

import { ContainerSkeleton, TableStatus } from '../../components';
import {
  getActiveValidators,
  getWaitingValidators,
} from '../../data/ValidatorTables';
import ValidatorTableContainer from './ValidatorTableContainer';

const pageSize = 10;
const activeValidatorsTableTab = 'Active Validators';
const waitingValidatorsTableTab = 'Waiting';

const ValidatorTablesContainer = () => {
  const { data: activeValidatorsData, isLoading: activeValidatorsDataLoading } =
    useSWR([getActiveValidators.name], ([, ...args]) =>
      getActiveValidators(...args)
    );

  const {
    data: waitingValidatorsData,
    isLoading: waitingValidatorsDataLoading,
  } = useSWR([getWaitingValidators.name], ([, ...args]) =>
    getWaitingValidators(...args)
  );

  return (
    <TableAndChartTabs
      tabs={[activeValidatorsTableTab, waitingValidatorsTableTab]}
      headerClassName="w-full overflow-x-auto"
    >
      {/* Active Validators Table */}
      <TabContent value={activeValidatorsTableTab}>
        {activeValidatorsData && activeValidatorsData.length === 0 ? (
          <TableStatus
            title="No Active Validators"
            description="Validators might be in the waiting state. Check back soon."
            buttonText="Learn More"
            buttonProps={{
              onClick: () => window.open(TANGLE_STAKING_URL, '_blank'),
            }}
            icon="⏳"
          />
        ) : activeValidatorsDataLoading || !activeValidatorsData ? (
          <ContainerSkeleton />
        ) : (
          <ValidatorTableContainer
            value={activeValidatorsData}
            pageSize={pageSize}
          />
        )}
      </TabContent>

      {/* Waiting Validators Table */}
      <TabContent value={waitingValidatorsTableTab}>
        {waitingValidatorsData && waitingValidatorsData.length === 0 ? (
          <TableStatus
            title="No Validators in Waiting"
            description="All validators are currently active. There are no validators in the waiting pool at the moment.
            "
            buttonText="Learn More"
            buttonProps={{
              onClick: () => window.open(TANGLE_STAKING_URL, '_blank'),
            }}
            icon="⏳"
          />
        ) : waitingValidatorsDataLoading || !waitingValidatorsData ? (
          <ContainerSkeleton />
        ) : (
          <ValidatorTableContainer
            value={waitingValidatorsData}
            pageSize={pageSize}
          />
        )}
      </TabContent>
    </TableAndChartTabs>
  );
};

export default ValidatorTablesContainer;
