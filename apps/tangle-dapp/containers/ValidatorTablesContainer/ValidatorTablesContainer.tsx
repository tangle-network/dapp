'use client';

import { TabContent, TableAndChartTabs } from '@webb-tools/webb-ui-components';
import { TANGLE_STAKING_URL } from '@webb-tools/webb-ui-components/constants';
import { useCallback, useState } from 'react';
import { map } from 'rxjs';

import { ContainerSkeleton, TableStatus } from '../../components';
import useValidators from '../../data/ValidatorTables/useActiveValidators';
import {
  activeValidatorFactory,
  waitingValidatorFactory,
} from '../../data/ValidatorTables/useActiveValidators';
import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import ValidatorTableContainer from './ValidatorTableContainer';

const pageSize = 10;
const activeValidatorsTableTab = 'Active Validators';
const waitingValidatorsTableTab = 'Waiting';

const ValidatorTablesContainer = () => {
  const { data: activeValidatorCount } = usePolkadotApiRx(
    useCallback(
      (api) =>
        activeValidatorFactory(api).pipe(
          map((validators) => validators.length)
        ),
      []
    )
  );

  const { data: waitingValidatorCount } = usePolkadotApiRx(
    useCallback(
      (api) =>
        waitingValidatorFactory(api).pipe(
          map((validators) => validators.length)
        ),
      []
    )
  );

  const [activeValidatorsPageIndex, setActiveValidatorsPageIndex] = useState(0);

  const [waitingValidatorsPageIndex, setWaitingValidatorsPageIndex] =
    useState(0);

  const { data: activeValidatorsData, isLoading: isActiveValidatorsLoading } =
    useValidators('Active', activeValidatorsPageIndex, pageSize);

  const { data: waitingValidatorsData, isLoading: isWaitingValidatorsLoading } =
    useValidators('Waiting', waitingValidatorsPageIndex, pageSize);

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
        ) : isActiveValidatorsLoading || !activeValidatorsData ? (
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
        ) : isWaitingValidatorsLoading || !waitingValidatorsData ? (
          <ContainerSkeleton />
        ) : (
          <ValidatorTableContainer
            data={waitingValidatorsData}
            pageSize={pageSize}
            pageIndex={waitingValidatorsPageIndex}
            totalRecordCount={waitingValidatorCount || 0}
            setPageIndex={setWaitingValidatorsPageIndex}
          />
        )}
      </TabContent>
    </TableAndChartTabs>
  );
};

export default ValidatorTablesContainer;
