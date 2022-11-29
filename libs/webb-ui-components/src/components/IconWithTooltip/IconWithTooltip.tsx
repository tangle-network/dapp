import { FC } from 'react';

import { Typography } from '../../typography/Typography';
import { Tooltip, TooltipBody, TooltipTrigger } from '../Tooltip/Tooltip';
import { IconWithTooltipProp } from './types';

export const IconWithTooltip: FC<IconWithTooltipProp> = ({ content, icon }) => {
  return (
    <Tooltip>
      <TooltipTrigger className="cursor-auto">{icon}</TooltipTrigger>
      <TooltipBody>
        {typeof content === 'string' || typeof content === 'number' ? (
          <Typography className="capitalize" variant="body1">
            {content}
          </Typography>
        ) : (
          content
        )}
      </TooltipBody>
    </Tooltip>
  );
};
