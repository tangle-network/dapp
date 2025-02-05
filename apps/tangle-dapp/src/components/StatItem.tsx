import { Typography } from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

export type StatItemProps = {
  title: string;
  subtitle?: string;
  removeBorder?: boolean;
  className?: string;
};

const StatItem: FC<StatItemProps> = ({
  title,
  subtitle,
  removeBorder = false,
  className: classNameProp,
}) => {
  const className = twMerge(
    cx('flex flex-col items-start justify-center px-3', {
      'border-l dark:border-mono-120': !removeBorder,
    }),
    classNameProp,
  );

  return (
    <div className={className}>
      <Typography className="dark:text-mono-0" variant="body1">
        {title}
      </Typography>

      {subtitle !== undefined && (
        <Typography
          variant="body2"
          className="text-mono-120 dark:text-mono-100"
        >
          {subtitle}
        </Typography>
      )}
    </div>
  );
};

export default StatItem;
