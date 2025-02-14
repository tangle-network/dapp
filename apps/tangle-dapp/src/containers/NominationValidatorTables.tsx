import { Search } from '@tangle-network/icons';
import TableStatus from '@tangle-network/tangle-shared-ui/components/tables/TableStatus';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import {
  Input,
  TabContent,
  TableAndChartTabs,
} from '@tangle-network/ui-components';
import { FC, useState } from 'react';

import { ContainerSkeleton } from '../components';
import useActiveValidators from '../data/ValidatorTables/useActiveValidators';
import useWaitingValidators from '../data/ValidatorTables/useWaitingValidators';
import ValidatorTable from '../components/ValidatorTable';

const TAB_ACTIVE = 'Active Validators';
const TAB_WAITING = 'Waiting';

const NominationValidatorTables: FC = () => {
  const { network } = useNetworkStore();
  const { validators: activeValidators } = useActiveValidators();
  const { validators: waitingValidators } = useWaitingValidators();

  const [searchValue, setSearchValue] = useState('');

  const isActiveValidatorsLoading = activeValidators === null;
  const isWaitingValidatorsLoading = waitingValidators === null;

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
        {activeValidators !== null && activeValidators.length === 0 ? (
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
          <ValidatorTable data={activeValidators} searchValue={searchValue} />
        )}
      </TabContent>

      {/* Waiting Validators Table */}
      <TabContent value={TAB_WAITING}>
        {waitingValidators !== null && waitingValidators.length === 0 ? (
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
            data={waitingValidators}
            searchValue={searchValue}
          />
        )}
      </TabContent>
    </TableAndChartTabs>
  );
};

export default NominationValidatorTables;
