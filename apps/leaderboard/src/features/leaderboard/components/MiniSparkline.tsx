import { ZERO_BIG_INT } from '@tangle-network/dapp-config';
import { BLOCK_COUNT_IN_ONE_DAY } from '../constants';
import { Account } from '../types';

export const MiniSparkline = ({
  pointsHistory,
}: {
  pointsHistory: Account['pointsHistory'];
}) => {
  // If no history, return empty array
  if (pointsHistory.length === 0) {
    return (
      <div className="flex items-end h-8 space-x-[2px]">
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className="w-1 bg-blue-500 dark:bg-blue-600"
            style={{ height: '10%' }}
          />
        ))}
      </div>
    );
  }

  // Get the most recent block number from the history
  const mostRecentBlockNumber =
    pointsHistory[pointsHistory.length - 1].blockNumber;

  // Cumulate points for each day
  const cumulatedPoints = pointsHistory
    .reduce(
      (acc, snapshot) => {
        // Calculate which day this block belongs to (0-6, where 0 is today)
        const blocksAgo = mostRecentBlockNumber - snapshot.blockNumber;
        const day = Math.floor(blocksAgo / BLOCK_COUNT_IN_ONE_DAY);

        // Only process blocks within the last 7 days
        if (day >= 0 && day < 7) {
          acc[day] = acc[day] + snapshot.points;
        }

        return acc;
      },
      Array.from({ length: 7 }, () => ZERO_BIG_INT),
    )
    .slice()
    .reverse();

  const max = cumulatedPoints.reduce((acc, curr) => {
    if (curr > acc) {
      return curr;
    }

    return acc;
  }, cumulatedPoints[0]);

  const min = cumulatedPoints.reduce((acc, curr) => {
    if (curr < acc) {
      return curr;
    }

    return acc;
  }, cumulatedPoints[0]);

  const range = max - min || BigInt(1);

  return (
    <div className="flex items-end h-8 space-x-[2px]">
      {cumulatedPoints.map((value, index) => {
        const height =
          ((value - min) * BigInt(100) * BigInt(10_000)) /
          range /
          BigInt(10_000);

        const maxHeight = height < BigInt(10) ? BigInt(10) : height;

        return (
          <div
            key={index}
            className="w-1 bg-blue-500 dark:bg-blue-600"
            style={{ height: `${maxHeight}%` }}
          />
        );
      })}
    </div>
  );
};
