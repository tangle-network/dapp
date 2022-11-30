import { FC, useState } from 'react';
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
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  return (
    <Tooltip
      isOpen={isTooltipOpen}
      onChange={(nextOpen) => setIsTooltipOpen(nextOpen)}
      {...overrideTooltipProps}
    >
      <TooltipTrigger
        onMouseEnter={() => setIsTooltipOpen(true)}
        onMouseLeave={() => setIsTooltipOpen(false)}
        {...overrideTooltipTriggerProps}
        className={twMerge(
          'cursor-auto',
          overrideTooltipTriggerProps?.className
        )}
      >
        {icon}
      </TooltipTrigger>
      <TooltipBody {...overrideTooltipBodyProps}>
        {typeof content === 'string' || typeof content === 'number' ? (
          <Typography className="capitalize" variant="body3">
            {content}
          </Typography>
        ) : (
          content
        )}
      </TooltipBody>
    </Tooltip>
  );
};
