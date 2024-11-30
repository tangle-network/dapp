'use client';

import { Search } from '@webb-tools/icons';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import {
  Input,
  TabContent,
  TableAndChartTabs,
} from '@webb-tools/webb-ui-components';
import { useState } from 'react';

import { ContainerSkeleton } from '../../components';
import TableStatus from '../../components/TableStatus';
import ValidatorTable from '../../components/ValidatorTable';
import useActiveValidators from '../../data/validators/useActiveValidators';
import useWaitingValidators from '../../data/validators/useWaitingValidators';

const activeValidatorsTableTab = 'Active Validators';
const waitingValidatorsTableTab = 'Waiting';

const ActiveAndWaitingValidatorTables = () => {
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
          id="nomination-search-validators"
          rightIcon={<Search className="mr-2" />}
          placeholder="Search validators by identity or address..."
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
          <ValidatorTable
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
          <ValidatorTable
            isWaiting
            data={waitingValidatorsData}
            searchValue={searchValue}
          />
        )}
      </TabContent>
    </TableAndChartTabs>
  );
};

export default ActiveAndWaitingValidatorTables;
