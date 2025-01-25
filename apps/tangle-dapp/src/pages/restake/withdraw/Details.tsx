import { FC, useMemo } from 'react';
import DetailsContainer from '../../../components/DetailsContainer';
import DetailItem from '../../../components/LiquidStaking/stakeAndUnstake/DetailItem';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';
import useSessionDurationMs from '../../../data/useSessionDurationMs';
import formatMsDuration from '../../../utils/formatMsDuration';

const Details: FC = () => {
  const { leaveDelegatorsDelay } = useRestakeConsts();
  const sessionDurationMs = useSessionDurationMs();

  const withdrawPeriod = useMemo(() => {
    if (sessionDurationMs === null || leaveDelegatorsDelay === null) {
      return null;
    }

    return formatMsDuration(sessionDurationMs * leaveDelegatorsDelay);
  }, [leaveDelegatorsDelay, sessionDurationMs]);

  return (
    <DetailsContainer>
      <DetailItem
        title="Withdrawal period"
        tooltip="Waiting time between scheduling and executing a withdrawal"
        value={withdrawPeriod}
      />
    </DetailsContainer>
  );
};

export default Details;
