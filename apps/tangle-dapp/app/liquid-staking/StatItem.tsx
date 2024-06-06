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
    <div className="flex flex-col items-center justify-center border-l dark:border-mono-120 px-3">
      <Typography className="dark:text-mono-0" variant="body2" fw="bold">
        {title}
      </Typography>

      <div className="flex gap-1 items-start justify-start">
        <Typography variant="body2" fw="normal">
          {subtitle}
        </Typography>

        {tooltip !== undefined && <InfoIconWithTooltip content={tooltip} />}
      </div>
    </div>
  );
};

export default StatItem;
