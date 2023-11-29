import {
  Tooltip,
  TooltipBody,
  TooltipTrigger,
} from '@webb-tools/webb-ui-components/components/Tooltip';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import cx from 'classnames';
import capitalize from 'lodash/capitalize';
import { FC } from 'react';

type Props = {
  badge: string;
  emoji: string;
};

const BadgeWithTooltip: FC<Props> = ({ badge, emoji }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cx(
            'w-2 md:w-6 aspect-square rounded-full',
            'flex items-center justify-center',
            'bg-[rgba(31,29,43,0.1)] cursor-pointer'
          )}
        >
          <Typography variant="mkt-caption">{emoji}</Typography>
        </div>
      </TooltipTrigger>

      <TooltipBody>{badge.split('_').map(capitalize).join(' ')}</TooltipBody>
    </Tooltip>
  );
};

export default BadgeWithTooltip;
