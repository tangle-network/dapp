'use client';

import { TabContent, TableAndChartTabs } from '@webb-tools/webb-ui-components';
import { TANGLE_STAKING_URL } from '@webb-tools/webb-ui-components/constants';
import { useCallback, useEffect, useState } from 'react';
import { map } from 'rxjs';
import useSWR from 'swr';

import { ContainerSkeleton, TableStatus } from '../../components';
import { getWaitingValidators } from '../../data/ValidatorTables';
import useActiveValidators from '../../hooks/useActiveValidators';
import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import ValidatorTableContainer from './ValidatorTableContainer';

const pageSize = 10;
const activeValidatorsTableTab = 'Active Validators';
const waitingValidatorsTableTab = 'Waiting';

const ValidatorTablesContainer = () => {
  const { data: activeValidatorCount } = usePolkadotApiRx(
    useCallback(
      (api) =>
        api.query.session
          .validators()
          .pipe(map((validators) => validators.length)),
      []
    )
  );

  const [activeValidatorsPageIndex, setActiveValidatorsPageIndex] = useState(0);

  const {
    result: activeValidatorsData,
    isLoading: activeValidatorsDataLoading,
  } = useActiveValidators(activeValidatorsPageIndex, pageSize);

  const {
    // data: waitingValidatorsData,
    isLoading: waitingValidatorsDataLoading,
  } = useSWR([getWaitingValidators.name], ([, ...args]) =>
    getWaitingValidators(...args)
  );

  // TODO: This is temporary.
  const waitingValidatorsData = [] as any;

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
          <ContainerSkeleton numOfRows={5} />
        ) : (
          <ValidatorTableContainer
            data={activeValidatorsData}
            pageSize={pageSize}
            pageIndex={activeValidatorsPageIndex}
            totalRecordCount={activeValidatorCount || 0}
            setPageIndex={setActiveValidatorsPageIndex}
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
            data={waitingValidatorsData}
            pageSize={pageSize}
            pageIndex={0}
            totalRecordCount={waitingValidatorsData.length}
            setPageIndex={() => void 0}
          />
        )}
      </TabContent>
    </TableAndChartTabs>
  );
};

export default ValidatorTablesContainer;
