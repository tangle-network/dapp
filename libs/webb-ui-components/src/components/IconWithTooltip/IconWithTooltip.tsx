import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { Typography } from '../../typography/Typography';
import { Tooltip, TooltipBody, TooltipTrigger } from '../Tooltip/Tooltip';
import { IconWithTooltipProp } from './types';

export const IconWithTooltip: FC<IconWithTooltipProp> = ({
  content,
  btnClassName,
  icon,
}) => {
  return (
    <Tooltip>
      <TooltipTrigger className={twMerge('cursor-auto', btnClassName)}>
        {icon}
      </TooltipTrigger>
      <TooltipBody>
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
