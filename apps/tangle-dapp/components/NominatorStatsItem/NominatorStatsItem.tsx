import { Typography } from '@webb-tools/webb-ui-components';
import type { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { InfoIconWithTooltip } from '..';
import NominatorStatsItemText from './NominatorStatsItemText';
import { NominatorStatsItemProps } from './types';

export const NominatorStatsItem: FC<NominatorStatsItemProps> = ({
  title,
  tooltip,
  className,
  ...restProps
}) => {
  return (
    <div className={twMerge('flex flex-col gap-4', className)}>
      <NominatorStatsItemText {...restProps} />

      <div className="flex items-center gap-0.5">
        <Typography variant="body1" className="text-mono-140 dark:text-mono-40">
          {title}
        </Typography>
        {tooltip && <InfoIconWithTooltip content={tooltip} />}
      </div>
    </div>
  );
};
