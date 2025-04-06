import { formatDistanceToNow } from 'date-fns';

export const formatDisplayBlockNumber = (
  blockNumber: number,
  blockTimestamp: Date | null | undefined,
) => {
  if (blockTimestamp) {
    return formatDistanceToNow(blockTimestamp, { addSuffix: true });
  }

  return `Block: #${blockNumber}`;
};
