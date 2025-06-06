import { InfoIconWithTooltip, Typography } from '@tangle-network/ui-components';
import { TypographyVariant } from '@tangle-network/ui-components/typography/types';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

export interface HeaderCellProps {
  title: string;
  tooltip?: string;
  className?: string;
  titleVariant?: TypographyVariant;
}

const HeaderCell: FC<HeaderCellProps> = ({
  title,
  tooltip,
  className,
  titleVariant = 'body1',
}) => {
  return (
    <Typography
      variant={titleVariant}
      fw="normal"
      className={twMerge(
        'whitespace-nowrap text-mono-140 dark:text-mono-100',
        'flex items-center gap-0.5',
        className,
      )}
    >
      {title}

      {tooltip !== undefined && (
        <InfoIconWithTooltip
          className="fill-current dark:fill-current"
          content={tooltip}
        />
      )}
    </Typography>
  );
};

export default HeaderCell;
