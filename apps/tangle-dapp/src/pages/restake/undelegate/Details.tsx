import DetailsContainer from '../../../components/DetailsContainer';
import DetailItem from '../../../components/LiquidStaking/stakeAndUnstake/DetailItem';
import { useProtocolConfig } from '@tangle-network/tangle-shared-ui/data/graphql';
import { FC, useMemo } from 'react';
import formatMsDuration from '../../../utils/formatMsDuration';

const Details: FC = () => {
  const { data: config } = useProtocolConfig();

  const undelegatePeriod = useMemo(() => {
    if (!config) {
      return null;
    }

    // Calculate delay in milliseconds from rounds and round duration
    const delayMs =
      Number(config.delegationBondLessDelay) *
      Number(config.roundDuration) *
      1000;
    return formatMsDuration(delayMs);
  }, [config]);

  return (
    <DetailsContainer>
      <DetailItem
        title="Undelegate period"
        tooltip="Waiting time between scheduling and executing an undelegation"
        value={undelegatePeriod}
      />
    </DetailsContainer>
  );
};

export default Details;
