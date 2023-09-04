import { FC } from 'react';
import { CopyWithTooltip } from '@webb-tools/webb-ui-components';

import { CopyIconWithTooltipProps } from './types';

const CopyIconWithTooltip: FC<CopyIconWithTooltipProps> = ({ textToCopy }) => {
  return (
    <CopyWithTooltip
      textToCopy={textToCopy}
      isButton={false}
      className="text-mono-140 dark:text-mono-40"
    />
  );
};

export default CopyIconWithTooltip;
