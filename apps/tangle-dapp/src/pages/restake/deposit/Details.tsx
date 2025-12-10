import { FC, useMemo } from 'react';
import DetailsContainer from '../../../components/DetailsContainer';
import DetailItem from '../../../components/LiquidStaking/stakeAndUnstake/DetailItem';
import { useWithdrawalDelay } from '@tangle-network/tangle-shared-ui/data/graphql';

/**
 * Format seconds into a human-readable duration string.
 */
const formatDuration = (seconds: bigint): string => {
  const totalSeconds = Number(seconds);

  if (totalSeconds < 60) {
    return `${totalSeconds} seconds`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''}`;
};

const Details: FC = () => {
  const { delay, delayRounds, isLoading } = useWithdrawalDelay();

  const withdrawPeriod = useMemo(() => {
    if (isLoading || delay === null) {
      return null;
    }

    const formattedDuration = formatDuration(delay);
    return `${formattedDuration} (${delayRounds} rounds)`;
  }, [delay, delayRounds, isLoading]);

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
