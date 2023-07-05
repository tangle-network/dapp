import { FC } from 'react';
import cx from 'classnames';
import {
  Tooltip,
  TooltipTrigger,
  TooltipBody,
  Typography,
} from '@webb-tools/webb-ui-components';
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
        'text-mono-140 flex-[1] flex items-center justify-center',
        className
      )}
    >
      {title}
      {tooltip && (
        <Tooltip>
          <TooltipTrigger>
            <InformationLine className="fill-mono-140" />
          </TooltipTrigger>
          <TooltipBody>
            <span>{tooltip}</span>
          </TooltipBody>
        </Tooltip>
      )}
    </Typography>
  );
};
