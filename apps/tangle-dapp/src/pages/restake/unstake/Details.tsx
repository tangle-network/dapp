import DetailsContainer from '../../../components/DetailsContainer';
import DetailItem from '../../../components/LiquidStaking/stakeAndUnstake/DetailItem';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';
import { FC, useMemo } from 'react';
import formatMsDuration from '../../../utils/formatMsDuration';
import useSessionDurationMs from '../../../data/useSessionDurationMs';

const Details: FC = () => {
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
        title="Undelegate period"
        tooltip="Waiting time between scheduling and executing an undelegation"
        value={unstakePeriod}
      />
    </DetailsContainer>
  );
};

export default Details;
