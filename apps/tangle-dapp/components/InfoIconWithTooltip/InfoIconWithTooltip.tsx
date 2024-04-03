import { InformationLine } from '@webb-tools/icons';
import { IconWithTooltip } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { InfoIconWithTooltipProps } from './types';

export const InfoIconWithTooltip: FC<InfoIconWithTooltipProps> = ({
  content,
  className,
}) => {
  return (
    <IconWithTooltip
      icon={<InformationLine className="fill-mono-140 dark:fill-mono-40" />}
      content={content}
      overrideTooltipBodyProps={{
        className: twMerge(
          '!max-w-[185px] !break-normal text-center',
          className
        ),
      }}
    />
  );
};
