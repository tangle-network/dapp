import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { InfoIconWithTooltip } from '..';
import KeyStatsItemText from './KeyStatsText';
import { KeyStatsItemProps } from './types';

export const KeyStatsItem: FC<KeyStatsItemProps> = ({
  title,
  tooltip,
  className,
  ...restProps
}) => {
  return (
    <div className={twMerge('px-2 py-2 space-y-2 md:px-4', className)}>
      <div className="flex items-center gap-0.5">
        <Typography variant="body1" className="text-mono-140 dark:text-mono-40">
          {title}
        </Typography>
        {tooltip && <InfoIconWithTooltip content={tooltip} />}
      </div>

      <KeyStatsItemText {...restProps} title={title} />
    </div>
  );
};
