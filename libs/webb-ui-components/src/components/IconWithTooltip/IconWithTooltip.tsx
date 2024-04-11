import { type FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { Typography } from '../../typography/Typography';
import { Tooltip, TooltipBody, TooltipTrigger } from '../Tooltip/Tooltip';
import { IconWithTooltipProp } from './types';

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
