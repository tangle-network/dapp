import { BLOCK_TIME_MS } from '@tangle-network/dapp-config';
import { formatTimeAgo } from '../../../utils';

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

    return formatTimeAgo(date);
  }

  return `Block: #${blockNumber}`;
};
