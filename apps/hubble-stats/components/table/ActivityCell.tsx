import { FC } from 'react';
import { Typography } from '@webb-tools/webb-ui-components';

import { ActivityCellProps } from './types';

const ActivityCell: FC<ActivityCellProps> = ({ txHash, activity }) => {
  return (
    <a href="#" target="_blank" rel="noreferrer">
      <Typography
        variant="body1"
        className="capitalize text-blue-70 dark:text-blue-50"
      >
        {activity}
      </Typography>
    </a>
  );
};

export default ActivityCell;
