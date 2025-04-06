import {
  Tooltip,
  TooltipBody,
  TooltipTrigger,
} from '@tangle-network/ui-components/components/Tooltip';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import capitalize from 'lodash/capitalize';
import type { FC } from 'react';
import { BADGE_ICON_RECORD, BadgeEnum } from '../constants';

export const BadgesCell: FC<{ badges: BadgeEnum[] }> = ({ badges }) => {
  return (
    <div className="flex items-center gap-0.5">
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
      <TooltipTrigger className="size-6 aspect-square flex-initial">
        {emoji}
      </TooltipTrigger>

      <TooltipBody>{badge.split('_').map(capitalize).join(' ')}</TooltipBody>
    </Tooltip>
  );
};
