'use client';

import { TabContent, TableAndChartTabs } from '@webb-tools/webb-ui-components';
import { TANGLE_STAKING_URL } from '@webb-tools/webb-ui-components/constants';

import { ContainerSkeleton, TableStatus } from '../../components';
import useActiveValidators from '../../data/ValidatorTables/useActiveValidators';
import useWaitingValidators from '../../data/ValidatorTables/useWaitingValidators';
import ValidatorTableContainer from './ValidatorTableContainer';

const activeValidatorsTableTab = 'Active Validators';
const waitingValidatorsTableTab = 'Waiting';

const ValidatorTablesContainer = () => {
  const activeValidatorsData = useActiveValidators();
  const waitingValidatorsData = useWaitingValidators();
  const isActiveValidatorsLoading = activeValidatorsData === null;
  const isWaitingValidatorsLoading = waitingValidatorsData === null;

  return (
    <TableAndChartTabs
      tabs={[activeValidatorsTableTab, waitingValidatorsTableTab]}
      headerClassName="w-full overflow-x-auto"
    >
      {/* Active Validators Table */}
      <TabContent value={activeValidatorsTableTab}>
        {activeValidatorsData !== null && activeValidatorsData.length === 0 ? (
          <TableStatus
            title="No Active Validators"
            description="Validators might be in the waiting state. Check back soon."
            buttonText="Learn More"
            buttonProps={{
              onClick: () => window.open(TANGLE_STAKING_URL, '_blank'),
            }}
            icon="⏳"
          />
        ) : isActiveValidatorsLoading ? (
          <ContainerSkeleton />
        ) : (
          <ValidatorTableContainer data={activeValidatorsData} />
        )}
      </TabContent>

      {/* Waiting Validators Table */}
      <TabContent value={waitingValidatorsTableTab}>
        {waitingValidatorsData !== null &&
        waitingValidatorsData.length === 0 ? (
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
        ) : isWaitingValidatorsLoading ? (
          <ContainerSkeleton />
        ) : (
          <ValidatorTableContainer data={waitingValidatorsData} />
        )}
      </TabContent>
    </TableAndChartTabs>
  );
};

export default ValidatorTablesContainer;
