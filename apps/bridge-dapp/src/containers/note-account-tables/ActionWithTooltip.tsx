import {
  Button,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { ActionWithTooltipProps } from './types';

export const ActionWithTooltip: FC<ActionWithTooltipProps> = ({
  tooltipContent,
  ...buttonProps
}) => {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <Button
          variant="utility"
          size="sm"
          {...buttonProps}
          className={twMerge('p-2', buttonProps.className)}
        />
      </TooltipTrigger>
      <TooltipBody>
        <Typography variant="body3">{tooltipContent}</Typography>
      </TooltipBody>
    </Tooltip>
  );
};
