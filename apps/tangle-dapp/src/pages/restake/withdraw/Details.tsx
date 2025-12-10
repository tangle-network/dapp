import { FC, useMemo } from 'react';
import DetailsContainer from '../../../components/DetailsContainer';
import DetailItem from '../../../components/LiquidStaking/stakeAndUnstake/DetailItem';
import { useProtocolConfig } from '@tangle-network/tangle-shared-ui/data/graphql';
import formatMsDuration from '../../../utils/formatMsDuration';

const Details: FC = () => {
  const { data: config } = useProtocolConfig();

  const withdrawPeriod = useMemo(() => {
    if (!config) {
      return null;
    }

    // Calculate delay in milliseconds from rounds and round duration
    const delayMs =
      Number(config.leaveDelegatorsDelay) * Number(config.roundDuration) * 1000;
    return formatMsDuration(delayMs);
  }, [config]);

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
