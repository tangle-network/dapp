import {
  InfoIconWithTooltip,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { HeaderCellProps } from './types';

const HeaderCell: FC<HeaderCellProps> = ({
  title,
  tooltip,
  className,
  titleVariant = 'body1',
}) => {
  return (
    <Typography
      variant={titleVariant}
      fw="bold"
      className={twMerge(
        'whitespace-nowrap text-mono-140 dark:text-mono-40',
        'flex items-center gap-0.5',
        className,
      )}
    >
      {title}

      {tooltip && <InfoIconWithTooltip content={tooltip} />}
    </Typography>
  );
};

export default HeaderCell;
