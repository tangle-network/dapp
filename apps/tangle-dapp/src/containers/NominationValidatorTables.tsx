import { Search } from '@webb-tools/icons';
import TableStatus from '@webb-tools/tangle-shared-ui/components/tables/TableStatus';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import {
  Input,
  TabContent,
  TableAndChartTabs,
} from '@webb-tools/webb-ui-components';
import { FC, useState } from 'react';

import { ContainerSkeleton } from '../components';
import useActiveValidators from '../data/ValidatorTables/useActiveValidators';
import useWaitingValidators from '../data/ValidatorTables/useWaitingValidators';
import ValidatorTable from '../components/ValidatorTable';

const TAB_ACTIVE = 'Active Validators';
const TAB_WAITING = 'Waiting';

const NominationValidatorTables: FC = () => {
  const { network } = useNetworkStore();
  const { validators: activeValidatorsData } = useActiveValidators();
  const { validators: waitingValidatorsData } = useWaitingValidators();

  const [searchValue, setSearchValue] = useState('');

  const isActiveValidatorsLoading = activeValidatorsData === null;
  const isWaitingValidatorsLoading = waitingValidatorsData === null;

  const learnMoreUrl = `https://polkadot.js.org/apps/?rpc=${network.wsRpcEndpoint}#/staking`;

  return (
    <TableAndChartTabs
      tabs={[TAB_ACTIVE, TAB_WAITING]}
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
      <TabContent value={TAB_ACTIVE}>
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
      <TabContent value={TAB_WAITING}>
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

export default NominationValidatorTables;
