import isDefined from '@webb-tools/dapp-types/utils/isDefined';

import pluralize from '@webb-tools/webb-ui-components/utils/pluralize';
import { FC } from 'react';
import DetailsContainer from '../../../components/DetailsContainer';
import DetailItem from '../../../components/LiquidStaking/stakeAndUnstake/DetailItem';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';

const Details: FC = () => {
  const { leaveDelegatorsDelay } = useRestakeConsts();

  return (
    <DetailsContainer>
      <DetailItem
        title="Withdrawal period"
        tooltip="Waiting time between scheduling and executing a withdrawal"
        value={
          isDefined(leaveDelegatorsDelay)
            ? `${leaveDelegatorsDelay} ${pluralize('session', leaveDelegatorsDelay !== 1)}`
            : leaveDelegatorsDelay
        }
      />
    </DetailsContainer>
  );
};

export default Details;
