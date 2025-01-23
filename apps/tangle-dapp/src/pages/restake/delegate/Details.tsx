import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import { memo } from 'react';

import DetailsContainer from '../../../components/DetailsContainer';
import DetailItem from '../../../components/LiquidStaking/stakeAndUnstake/DetailItem';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';
import pluralize from '@webb-tools/webb-ui-components/utils/pluralize';

const Details = memo(() => {
  const { delegationBondLessDelay } = useRestakeConsts();

  return (
    <DetailsContainer>
      <DetailItem
        title="Undelegate period"
        tooltip="Waiting time between scheduling and executing an undelegation"
        value={
          isDefined(delegationBondLessDelay)
            ? `${delegationBondLessDelay} ${pluralize('session', delegationBondLessDelay !== 1)}`
            : delegationBondLessDelay
        }
      />
    </DetailsContainer>
  );
});

Details.displayName = 'Info';

export default Details;
