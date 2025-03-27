import { ArrowDownIcon } from '@tangle-network/icons';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { Account } from '../types';

export const TrendIndicator = ({
  pointsHistory,
}: {
  pointsHistory: Account['pointsHistory'];
}) => {
  if (pointsHistory.length === 0) {
    return <div>0</div>;
  }

  const diff =
    pointsHistory[pointsHistory.length - 1].points - pointsHistory[0].points;

  const direction = diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral';
  const value = pointsHistory[pointsHistory.length - 1].points.toLocaleString();

  if (direction === 'up') {
    return (
      <Typography variant="body1" className="flex items-center gap-1">
        {value}{' '}
        <ArrowDownIcon
          size="lg"
          className="fill-green-600 dark:fill-green-400 -rotate-[135deg]"
        />
      </Typography>
    );
  } else if (direction === 'down') {
    return (
      <Typography variant="body1" className="flex items-center gap-1">
        {value}{' '}
        <ArrowDownIcon
          size="lg"
          className="fill-red-600 dark:fill-red-400 -rotate-45"
        />
      </Typography>
    );
  }

  return <div>{value}</div>;
};
