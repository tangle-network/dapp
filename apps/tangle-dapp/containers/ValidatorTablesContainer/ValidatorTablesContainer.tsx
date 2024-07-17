'use client';

import { Search } from '@webb-tools/icons';
import {
  Input,
  TabContent,
  TableAndChartTabs,
} from '@webb-tools/webb-ui-components';
import { useState } from 'react';

import { ContainerSkeleton, TableStatus } from '../../components';
import useNetworkStore from '../../context/useNetworkStore';
import useActiveValidators from '../../data/ValidatorTables/useActiveValidators';
import useWaitingValidators from '../../data/ValidatorTables/useWaitingValidators';
import ValidatorTableContainer from './ValidatorTableContainer';

const activeValidatorsTableTab = 'Active Validators';
const waitingValidatorsTableTab = 'Waiting';

const ValidatorTablesContainer = () => {
  const { network } = useNetworkStore();
  const { validators: activeValidatorsData } = useActiveValidators();
  const { validators: waitingValidatorsData } = useWaitingValidators();

  const [searchValue, setSearchValue] = useState('');

  const isActiveValidatorsLoading = activeValidatorsData === null;
  const isWaitingValidatorsLoading = waitingValidatorsData === null;

  const learnMoreUrl = `https://polkadot.js.org/apps/?rpc=${network.wsRpcEndpoint}#/staking`;

  return (
    <TableAndChartTabs
      tabs={[activeValidatorsTableTab, waitingValidatorsTableTab]}
      headerClassName="w-full"
      additionalActionsCmp={
        <Input
          id="search-validators"
          rightIcon={<Search className="mr-2" />}
          placeholder="Search validators..."
          value={searchValue}
          onChange={(val) => setSearchValue(val)}
          isControlled
          className="w-2/5"
        />
      }
    >
      {/* Active Validators Table */}
      <TabContent value={activeValidatorsTableTab}>
        {activeValidatorsData !== null && activeValidatorsData.length === 0 ? (
          <TableStatus
            title="No Active Validators"
            description="Validators might be in the waiting state. Check back soon."
            buttonText="Learn More"
            buttonProps={{
              href: learnMoreUrl,
              target: '_blank',
            }}
            icon="⏳"
          />
        ) : isActiveValidatorsLoading ? (
          <ContainerSkeleton />
        ) : (
          <ValidatorTableContainer
            data={activeValidatorsData}
            searchValue={searchValue}
          />
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
              href: learnMoreUrl,
              target: '_blank',
            }}
            icon="⏳"
          />
        ) : isWaitingValidatorsLoading ? (
          <ContainerSkeleton />
        ) : (
          <ValidatorTableContainer
            isWaiting
            data={waitingValidatorsData}
            searchValue={searchValue}
          />
        )}
      </TabContent>
    </TableAndChartTabs>
  );
};

export default ValidatorTablesContainer;
