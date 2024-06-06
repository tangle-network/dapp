import {
  InfoIconWithTooltip,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';

export type StatItemProps = {
  title: string;
  subtitle: string;
  tooltip?: string;
};

const StatItem: FC<StatItemProps> = ({ title, subtitle, tooltip }) => {
  return (
    <div className="flex flex-col border-l dark:border-mono-120 px-3">
      <Typography className="dark:text-mono-0" variant="body2" fw="bold">
        {title}
      </Typography>

      <div className="flex gap-1 items-center justify-center">
        <Typography variant="body2" fw="bold">
          {subtitle}
        </Typography>

        {tooltip !== undefined && <InfoIconWithTooltip content={tooltip} />}
      </div>
    </div>
  );
};

export default StatItem;
