import { type FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { Typography } from '../../typography/Typography/index.js';
import { Tooltip, TooltipBody, TooltipTrigger } from '../Tooltip/Tooltip.js';
import { IconWithTooltipProp } from './types.js';

export const IconWithTooltip: FC<IconWithTooltipProp> = ({
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
          overrideTooltipTriggerProps?.className
        )}
      >
        {icon}
      </TooltipTrigger>

      <TooltipBody {...overrideTooltipBodyProps}>
        <Typography variant="body3" className="text-center break-normal">
          {content}
        </Typography>
      </TooltipBody>
    </Tooltip>
  );
};
