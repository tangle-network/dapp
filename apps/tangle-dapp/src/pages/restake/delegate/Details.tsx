import { memo, useMemo } from 'react';

import DetailsContainer from '../../../components/DetailsContainer';
import DetailItem from '../../../components/LiquidStaking/stakeAndUnstake/DetailItem';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';
import useSessionDurationMs from '../../../data/useSessionDurationMs';
import formatMsDuration from '../../../utils/formatMsDuration';

const Details = memo(() => {
  const { delegationBondLessDelay } = useRestakeConsts();
  const sessionDurationMs = useSessionDurationMs();

  const unstakePeriod = useMemo(() => {
    if (sessionDurationMs === null || delegationBondLessDelay === null) {
      return null;
    }

    return formatMsDuration(sessionDurationMs * delegationBondLessDelay);
  }, [delegationBondLessDelay, sessionDurationMs]);

  return (
    <DetailsContainer>
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
