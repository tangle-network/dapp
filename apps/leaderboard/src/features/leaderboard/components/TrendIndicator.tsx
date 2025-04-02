import { TriangleDownIcon, TriangleUpIcon } from '@tangle-network/icons';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { Account } from '../types';

const ICON_SIZE = 10;

export const TrendIndicator = ({
  pointsHistory,
}: {
  pointsHistory: Account['pointsHistory'];
}) => {
  if (pointsHistory.length === 0) {
    return <Typography variant="body1">0</Typography>;
  }

  const diff =
    pointsHistory[pointsHistory.length - 1].points - pointsHistory[0].points;

  const direction = diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral';
  const value = pointsHistory[pointsHistory.length - 1].points.toLocaleString();

  if (direction === 'up') {
    return (
      <Typography
        variant="body1"
        className="flex items-center gap-1 text-green-600 dark:text-green-400"
      >
        <TriangleUpIcon
          width={ICON_SIZE}
          height={ICON_SIZE}
          style={{ minWidth: ICON_SIZE, minHeight: ICON_SIZE }}
          className="!fill-current"
        />
        {value}{' '}
      </Typography>
    );
  } else if (direction === 'down') {
    return (
      <Typography
        variant="body1"
        className="flex items-center gap-1 text-red-600 dark:text-red-400"
      >
        <TriangleDownIcon
          width={ICON_SIZE}
          height={ICON_SIZE}
          style={{ minWidth: ICON_SIZE, minHeight: ICON_SIZE }}
          className="!fill-current"
        />
        {value}{' '}
      </Typography>
    );
  }

  return <Typography variant="body1">{value}</Typography>;
};
