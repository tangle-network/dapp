import { KeyStatsItem } from '@tangle-network/ui-components';
import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components/constants';
import { Typography } from '@tangle-network/ui-components/typography';
import useActiveAccountPoints from '../../data/points/useActiveAccountPoints';
import addCommasToNumber from '@tangle-network/ui-components/utils/addCommasToNumber';

const AccountPoints = () => {
  const {
    data: points,
    error: pointsError,
    isPending: isPointsLoading,
  } = useActiveAccountPoints();

  return (
    <KeyStatsItem
      className="!p-0"
      title="Points Earned"
      hideErrorNotification
      isLoading={isPointsLoading}
      error={pointsError}
      tooltip="Points earned toward airdrop through network participation."
    >
      <div className="flex items-baseline gap-2">
        <Typography
          variant="h4"
          fw="bold"
          className="text-mono-140 dark:text-mono-40"
          component="span"
        >
          {points === undefined
            ? EMPTY_VALUE_PLACEHOLDER
            : addCommasToNumber(points)}
        </Typography>

        <Typography
          variant="body1"
          className="text-mono-140 dark:text-mono-40"
          component="span"
        >
          XP
        </Typography>
      </div>
    </KeyStatsItem>
  );
};

export default AccountPoints;
