import capitalize from 'lodash/capitalize';
import cx from 'classnames';
import {
  Tooltip,
  TooltipBody,
  TooltipTrigger,
} from '@tangle-network/ui-components/components/Tooltip';
import type { FC } from 'react';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { BADGE_ICON_RECORD, BadgeEnum } from '../constants';

export const BadgesCell: FC<{ badges: BadgeEnum[] }> = ({ badges }) => {
  return (
    <div className="flex flex-wrap gap-[2px]">
      {badges.length === 0 ? (
        <Typography variant="body1">No badges</Typography>
      ) : (
        badges.map((badge, idx) => (
          <BadgeWithTooltip
            key={`${idx}-${badge.toString()}`}
            emoji={BADGE_ICON_RECORD[badge]}
            badge={badge.toString()}
          />
        ))
      )}
    </div>
  );
};

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
            'size-6 aspect-square rounded-full cursor-pointer',
            'flex items-center justify-center',
          )}
        >
          <Typography variant="body1">{emoji}</Typography>
        </div>
      </TooltipTrigger>

      <TooltipBody>{badge.split('_').map(capitalize).join(' ')}</TooltipBody>
    </Tooltip>
  );
};
