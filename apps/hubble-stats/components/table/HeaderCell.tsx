import { FC } from 'react';
import cx from 'classnames';
import { IconWithTooltip, Typography } from '@webb-tools/webb-ui-components';
import { InformationLine } from '@webb-tools/icons';

interface HeaderCellProps {
  title: string;
  tooltip?: string;
  className?: string;
}

export const HeaderCell: FC<HeaderCellProps> = ({
  title,
  tooltip,
  className,
}) => {
  return (
    <Typography
      variant="body1"
      fw="bold"
      className={cx(
        'text-mono-140 dark:text-mono-40 flex-[1] flex items-center justify-center',
        className
      )}
    >
      {title}
      {tooltip && (
        <IconWithTooltip
          icon={<InformationLine className="fill-mono-140 dark:fill-mono-40" />}
          content={tooltip}
        />
      )}
    </Typography>
  );
};
