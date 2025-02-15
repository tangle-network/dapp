import { type FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { Tooltip, TooltipBody, TooltipTrigger } from '../Tooltip/Tooltip';
import { IconWithTooltipProp } from './types';

const IconWithTooltip: FC<IconWithTooltipProp> = ({
  content,
  icon,
  overrideTooltipBodyProps,
  overrideTooltipTriggerProps,
  overrideTooltipProps,
}) => {
  return (
    <Tooltip {...overrideTooltipProps}>
      <TooltipTrigger
        {...overrideTooltipTriggerProps}
        className={twMerge(
          'cursor-auto',
          overrideTooltipTriggerProps?.className,
        )}
      >
        {icon}
      </TooltipTrigger>

      <TooltipBody {...overrideTooltipBodyProps}>{content}</TooltipBody>
    </Tooltip>
  );
};

export default IconWithTooltip;
