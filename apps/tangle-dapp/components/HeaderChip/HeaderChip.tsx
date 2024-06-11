import {
  Chip,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import { type FC, useMemo } from 'react';

import ChipText from './ChipText';
import { HeaderChipItemProps } from './types';

export const HeaderChip: FC<HeaderChipItemProps> = ({
  Icon,
  label,
  hasTooltip = false,
  tooltipContent,
}: HeaderChipItemProps) => {
  const mainContent = useMemo(
    () => (
      <Chip color="blue">
        <Icon size="lg" className="stroke-blue-90 dark:stroke-blue-30" />
        <ChipText label={label} />
      </Chip>
    ),
    [Icon, label],
  );

  if (hasTooltip && tooltipContent) {
    return (
      <Tooltip>
        <TooltipTrigger>{mainContent}</TooltipTrigger>
        <TooltipBody>
          <Typography variant="body2">{tooltipContent}</Typography>
        </TooltipBody>
      </Tooltip>
    );
  }

  return mainContent;
};
