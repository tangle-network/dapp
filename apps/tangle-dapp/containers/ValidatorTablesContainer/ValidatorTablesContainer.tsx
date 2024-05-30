'use client';

import { TabContent, TableAndChartTabs } from '@webb-tools/webb-ui-components';

import { ContainerSkeleton, TableStatus } from '../../components';
import useActiveValidators from '../../data/ValidatorTables/useActiveValidators';
import useWaitingValidators from '../../data/ValidatorTables/useWaitingValidators';
import ValidatorTableContainer from './ValidatorTableContainer';
import useNetworkStore from '../../context/useNetworkStore';

const activeValidatorsTableTab = 'Active Validators';
const waitingValidatorsTableTab = 'Waiting';

const ValidatorTablesContainer = () => {
  const { network } = useNetworkStore();
  const activeValidatorsData = useActiveValidators();
  const waitingValidatorsData = useWaitingValidators();
  const isActiveValidatorsLoading = activeValidatorsData === null;
  const isWaitingValidatorsLoading = waitingValidatorsData === null;

  const learnMoreUrl = `https://polkadot.js.org/apps/?rpc=${network.wsRpcEndpoint}#/staking`;

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
              onClick: () => window.open(learnMoreUrl, '_blank'),
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
            title="No Waiting Validators"
            description="All validators are currently active. There are no validators in the waiting pool at the moment.
            "
            buttonText="Learn More"
            buttonProps={{
              onClick: () => window.open(learnMoreUrl, '_blank'),
            }}
            icon="⏳"
          />
        ) : isWaitingValidatorsLoading ? (
          <ContainerSkeleton />
        ) : (
          <ValidatorTableContainer isWaiting data={waitingValidatorsData} />
        )}
      </TabContent>
    </TableAndChartTabs>
  );
};

export default ValidatorTablesContainer;
