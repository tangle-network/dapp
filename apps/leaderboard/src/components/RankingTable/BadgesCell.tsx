import capitalize from 'lodash/capitalize';
import cx from 'classnames';
import {
  Tooltip,
  TooltipBody,
  TooltipTrigger,
} from '@tangle-network/ui-components/components/Tooltip';
import type { FC } from 'react';
import { BADGE_ICON_RECORD } from '../../constants';
import { BadgeEnum } from '../../types/BadgeEnum';
import { Typography } from '@tangle-network/ui-components/typography/Typography';

const BadgesCell: FC<{ badges: BadgeEnum[] }> = ({ badges }) => {
  return (
    <div className="flex flex-wrap gap-[2px]">
      {badges.map((badge, idx) => (
        <BadgeWithTooltip
          key={`${idx}-${badge.toString()}`}
          emoji={BADGE_ICON_RECORD[badge]}
          badge={badge.toString()}
        />
      ))}
    </div>
  );
};

export default BadgesCell;

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
            'size-8 aspect-square rounded-full',
            'flex items-center justify-center',
            'cursor-pointer bg-mono-60 dark:bg-mono-120',
          )}
        >
          <Typography variant="h5">{emoji}</Typography>
        </div>
      </TooltipTrigger>

      <TooltipBody>{badge.split('_').map(capitalize).join(' ')}</TooltipBody>
    </Tooltip>
  );
};
