import { Suspense, type FC } from 'react';
import {
  Chip,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';

import { HeaderChipItemProps } from './types';
import { getRoundedDownNumberWith2Decimals } from '../../utils';

const HeaderChipItem: FC<HeaderChipItemProps> = ({
  Icon,
  label,
  hasTooltip = false,
  tooltipContent,
  dataFetcher,
}: HeaderChipItemProps) => {
  const mainContent = (
    <Chip color="blue" className="normal-case whitespace-nowrap">
      <Icon size="lg" className="fill-blue-90 dark:fill-blue-30" />
      {label}:{' '}
      <Suspense
        fallback={
          <div className="animate-pulse">
            <div className="w-[100px] h-6 rounded-md bg-slate-200 dark:bg-mono-160" />
          </div>
        }
      >
        <HeaderChipItemValue dataFetcher={dataFetcher} />
      </Suspense>
    </Chip>
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

export default HeaderChipItem;

const HeaderChipItemValue = async ({
  dataFetcher,
}: Pick<HeaderChipItemProps, 'dataFetcher'>) => {
  const value = await dataFetcher();

  return (
    <>
      {typeof value === 'number'
        ? getRoundedDownNumberWith2Decimals(value)
        : '-'}{' '}
      webbtTNT
    </>
  );
};
