import { formatDistanceToNow } from 'date-fns';
import { BLOCK_TIME_MS } from '@tangle-network/dapp-config';

export const formatDisplayBlockNumber = (
  blockNumber: number,
  latestBlockNumber?: number | null,
  latestBlockTimestamp?: Date | null,
) => {
  if (latestBlockNumber && latestBlockTimestamp) {
    const date = new Date(
      latestBlockTimestamp.getTime() +
        (blockNumber - latestBlockNumber) * BLOCK_TIME_MS,
    );

    return formatDistanceToNow(date, { addSuffix: true });
  }

  return `Block: #${blockNumber}`;
};
