import {
  Chip,
  SkeletonLoader,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import { type FC, Suspense, useMemo } from 'react';

import { getRoundedDownNumberWith2Decimals } from '../../utils';
import { HeaderChipItemProps } from './types';

export const HeaderChip: FC<HeaderChipItemProps> = ({
  Icon,
  label,
  hasTooltip = false,
  tooltipContent,
  dataFetcher,
}: HeaderChipItemProps) => {
  const mainContent = useMemo(
    () => (
      <Chip color="blue">
        <Icon size="lg" className="stroke-blue-90 dark:stroke-blue-30" />
        {label}:{' '}
        <Suspense fallback={<SkeletonLoader className="w-[100px]" />}>
          <HeaderChipValue dataFetcher={dataFetcher} />
        </Suspense>
      </Chip>
    ),
    [Icon, label, dataFetcher]
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

const HeaderChipValue = async ({
  dataFetcher,
}: Pick<HeaderChipItemProps, 'dataFetcher'>) => {
  const value = await dataFetcher();

  return <>{getRoundedDownNumberWith2Decimals(value)}</>;
};
