import {
  InfoIconWithTooltip,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { HeaderCellProps } from './types';

const HeaderCell: FC<HeaderCellProps> = ({ title, tooltip, className }) => {
  return (
    <Typography
      variant="body1"
      fw="bold"
      className={twMerge(
        'text-mono-140 dark:text-mono-40 flex-[1] whitespace-nowrap',
        'flex items-center justify-center gap-0.5',
        className,
      )}
    >
      {title}
      {tooltip && <InfoIconWithTooltip content={tooltip} />}
    </Typography>
  );
};

export default HeaderCell;
