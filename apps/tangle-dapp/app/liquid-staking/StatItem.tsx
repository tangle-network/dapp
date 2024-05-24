import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

export type StatItemProps = {
  title: string;
  subtitle: string;
};

const StatItem: FC<StatItemProps> = ({ title, subtitle }) => {
  return (
    <div className="flex flex-col border-l dark:border-mono-120 px-3">
      <Typography className="dark:text-mono-0" variant="body2" fw="bold">
        {title}
      </Typography>

      <Typography variant="body2" fw="bold">
        {subtitle}
      </Typography>
    </div>
  );
};

export default StatItem;
