import { memo, useMemo } from 'react';

import DetailsContainer from '../../../components/DetailsContainer';
import DetailItem from '../../../components/LiquidStaking/stakeAndUnstake/DetailItem';
import { useProtocolConfig } from '@tangle-network/tangle-shared-ui/data/graphql';
import formatMsDuration from '../../../utils/formatMsDuration';

const Details = memo(() => {
  const { data: config } = useProtocolConfig();

  const unstakePeriod = useMemo(() => {
    if (!config || !config.isSupported) {
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
        value={unstakePeriod}
      />
    </DetailsContainer>
  );
});

Details.displayName = 'Info';

export default Details;
