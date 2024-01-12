import { InformationLine } from '@webb-tools/icons';
import { IconWithTooltip } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { InfoIconWithTooltipProps } from './types';

export const InfoIconWithTooltip: FC<InfoIconWithTooltipProps> = ({
  content,
}) => {
  return (
    <IconWithTooltip
      overrideTooltipBodyProps={{
        className: '!max-w-[400px] !break-normal',
      }}
      icon={<InformationLine className="fill-mono-140 dark:fill-mono-40" />}
      content={content}
    />
  );
};
