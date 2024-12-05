import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import { memo } from 'react';

import DetailsContainer from '../../../components/DetailsContainer';
import DetailItem from '../../../components/LiquidStaking/stakeAndUnstake/DetailItem';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';

const Info = memo(() => {
  const { leaveDelegatorsDelay, delegationBondLessDelay } = useRestakeConsts();

  return (
    <DetailsContainer>
      <DetailItem
        title="Unstake period"
        tooltip="Number of sessions that delegators remain bonded before the exit request is executable."
        value={
          isDefined(leaveDelegatorsDelay)
            ? `${leaveDelegatorsDelay} sessions`
            : leaveDelegatorsDelay
        }
      />

      <DetailItem
        title="Bond less delay"
        tooltip="Number of sessions that delegation bond less requests must wait before being executable."
        value={
          isDefined(delegationBondLessDelay)
            ? `${delegationBondLessDelay} sessions`
            : delegationBondLessDelay
        }
      />
    </DetailsContainer>
  );
});

Info.displayName = 'Info';

export default Info;
