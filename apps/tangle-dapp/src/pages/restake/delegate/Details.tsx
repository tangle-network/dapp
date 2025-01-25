import { memo, useMemo } from 'react';

import DetailsContainer from '../../../components/DetailsContainer';
import DetailItem from '../../../components/LiquidStaking/stakeAndUnstake/DetailItem';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';
import useSessionDurationMs from '../../../data/useSessionDurationMs';
import formatMsDuration from '../../../utils/formatMsDuration';

const Details = memo(() => {
  const { bondDuration, delegationBondLessDelay } = useRestakeConsts();
  const sessionDurationMs = useSessionDurationMs();

  const unstakePeriod = useMemo(() => {
    if (sessionDurationMs === null || delegationBondLessDelay === null) {
      return null;
    }

    return formatMsDuration(sessionDurationMs * delegationBondLessDelay);
  }, [delegationBondLessDelay, sessionDurationMs]);

  const bondedPeriod = useMemo(() => {
    if (sessionDurationMs === null || bondDuration === null) {
      return null;
    }

    return formatMsDuration(sessionDurationMs * bondDuration);
  }, [bondDuration, sessionDurationMs]);

  return (
    <DetailsContainer>
      <DetailItem
        title="Bond duration"
        tooltip="During this time, you won't be able to initiate an undelegate request for this stake."
        value={bondedPeriod}
      />

      <DetailItem
        title="Undelegate delay"
        tooltip="When you decide to undelegate your stake, you'll need to wait for this period to pass before your request can be processed."
        value={unstakePeriod}
      />
    </DetailsContainer>
  );
});

Details.displayName = 'Info';

export default Details;
