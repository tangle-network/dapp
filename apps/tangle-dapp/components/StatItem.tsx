import {
  InfoIconWithTooltip,
  Typography,
} from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import { FC } from 'react';

export type StatItemProps = {
  title: string;
  subtitle: string;
  tooltip?: string;
  largeSubtitle?: boolean;
  removeBorder?: boolean;
};

const StatItem: FC<StatItemProps> = ({
  title,
  subtitle,
  tooltip,
  largeSubtitle = false,
  removeBorder = false,
}) => {
  const className = cx('flex flex-col items-start justify-center px-3', {
    'border-l dark:border-mono-120': !removeBorder,
  });

  return (
    <div className={className}>
      <Typography className="dark:text-mono-0" variant="body2" fw="bold">
        {title}
      </Typography>

      <div className="flex gap-1 items-start justify-start">
        <Typography
          variant={largeSubtitle ? 'body1' : 'body2'}
          fw="normal"
          className="text-mono-120 dark:text-mono-100"
        >
          {subtitle}
        </Typography>

        {tooltip !== undefined && <InfoIconWithTooltip content={tooltip} />}
      </div>
    </div>
  );
};

export default StatItem;
