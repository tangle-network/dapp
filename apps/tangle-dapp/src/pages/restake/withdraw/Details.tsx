import DetailsContainer from '../../../components/DetailsContainer';
import DetailItem from '../../../components/LiquidStaking/stakeAndUnstake/DetailItem';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';
import { FC, useMemo } from 'react';
import useSessionDurationMs from '../../../data/useSessionDurationMs';
import formatMsDuration from '../../../utils/formatMsDuration';

const Details: FC = () => {
  const { bondDuration } = useRestakeConsts();
  const sessionDurationMs = useSessionDurationMs();

  const withdrawPeriod = useMemo(() => {
    if (sessionDurationMs === null || bondDuration === null) {
      return null;
    }

    return formatMsDuration(sessionDurationMs * bondDuration);
  }, [bondDuration, sessionDurationMs]);

  return (
    <DetailsContainer>
      <DetailItem
        title="Execution delay"
        tooltip="The time you'll need to wait before this withdrawal request can be completed."
        value={withdrawPeriod}
      />
    </DetailsContainer>
  );
};

export default Details;
