import {
  Chip,
  SkeletonLoader,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import { useMemo } from 'react';

import getRoundedDownNumberWith2Decimals from '../../utils/getRoundedDownNumberWith2Decimals';
import { HeaderChipItemProps } from './types';

function HeaderChipItem<T>({
  Icon,
  label,
  hasTooltip = false,
  tooltipContent,
  isLoading,
  value,
}: HeaderChipItemProps<T>) {
  const mainContent = useMemo(
    () => (
      <Chip color="blue" className="normal-case whitespace-nowrap">
        <Icon size="lg" className="fill-blue-90 dark:fill-blue-30" />
        {label}:{' '}
        {isLoading ? (
          <SkeletonLoader className="w-[100px]" />
        ) : (
          <>
            {typeof value === 'number'
              ? getRoundedDownNumberWith2Decimals(value)
              : '-'}{' '}
            webbtTNT
          </>
        )}
      </Chip>
    ),
    [Icon, isLoading, label, value]
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
}

export default HeaderChipItem;
