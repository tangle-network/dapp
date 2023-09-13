import { FC } from 'react';
import { Typography } from '@webb-tools/webb-ui-components';

import { ActivityCellProps } from './types';

const ActivityCell: FC<ActivityCellProps> = ({ activity }) => {
  return (
    <Typography
      variant="body1"
      className="capitalize text-blue-70 dark:text-blue-50"
    >
      {activity}
    </Typography>
  );
};

export default ActivityCell;
