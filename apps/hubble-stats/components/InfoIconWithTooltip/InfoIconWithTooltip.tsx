import { FC } from 'react';
import { IconWithTooltip } from '@webb-tools/webb-ui-components';
import { InformationLine } from '@webb-tools/icons';

import { InfoIconWithTooltipProps } from './types';

const InfoIconWithTooltip: FC<InfoIconWithTooltipProps> = ({ content }) => {
  return (
    <IconWithTooltip
      icon={<InformationLine className="fill-mono-140 dark:fill-mono-40" />}
      content={<p className="break-normal max-w-max">{content}</p>}
    />
  );
};

export default InfoIconWithTooltip;
