import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import { memo } from 'react';

import DetailsContainer from '../../../components/DetailsContainer';
import DetailItem from '../../../components/LiquidStaking/stakeAndUnstake/DetailItem';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';
import pluralize from '@webb-tools/webb-ui-components/utils/pluralize';

const Details = memo(() => {
  const { leaveDelegatorsDelay, delegationBondLessDelay } = useRestakeConsts();

  return (
    <DetailsContainer>
      <DetailItem
        title="Undelegate period"
        tooltip="Number of sessions that delegation bond less requests must wait before being executable."
        value={
          isDefined(delegationBondLessDelay)
            ? `${delegationBondLessDelay} ${pluralize('session', delegationBondLessDelay !== 1)}`
            : delegationBondLessDelay
        }
      />

      <DetailItem
        title="Withdrawal period"
        tooltip="Number of sessions that delegators remain bonded before the exit request is executable."
        value={
          isDefined(leaveDelegatorsDelay)
            ? `${leaveDelegatorsDelay} ${pluralize('session', leaveDelegatorsDelay !== 1)}`
            : leaveDelegatorsDelay
        }
      />
    </DetailsContainer>
  );
});

Details.displayName = 'Info';

export default Details;
