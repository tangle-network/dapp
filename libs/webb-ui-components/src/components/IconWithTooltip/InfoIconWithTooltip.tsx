import { InformationLine } from '@webb-tools/icons';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import IconWithTooltip from './IconWithTooltip';
import { IconWithTooltipProp } from './types';

const InfoIconWithTooltip: FC<
  Omit<IconWithTooltipProp, 'icon'> & { className?: string }
> = ({ className, ...props }) => {
  return (
    <IconWithTooltip
      icon={
        <InformationLine
          className={twMerge('fill-mono-140 dark:fill-mono-40', className)}
        />
      }
      {...props}
    />
  );
};

export default InfoIconWithTooltip;
