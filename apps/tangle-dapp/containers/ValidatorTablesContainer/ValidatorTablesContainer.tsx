'use client';

import { TabContent, TableAndChartTabs } from '@webb-tools/webb-ui-components';
import useSWR from 'swr';

import { ContainerSkeleton } from '../../components';
import {
  getActiveValidators,
  getWaitingValidators,
} from '../../data/ValidatorTables';
import ValidatorTableContainer from './ValidatorTableContainer';

const pageSize = 10;
const activeValidatorsTableTab = 'Active Validators';
const waitingValidatorsTableTab = 'Waiting Validators';

const ShieldedTablesContainer = () => {
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
        {activeValidatorsDataLoading || !activeValidatorsData ? (
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
        {waitingValidatorsDataLoading || !waitingValidatorsData ? (
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

export default ShieldedTablesContainer;
