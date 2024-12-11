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
          className={twMerge('fill-current dark:fill-current', className)}
        />
      }
      {...props}
    />
  );
};

export default InfoIconWithTooltip;
