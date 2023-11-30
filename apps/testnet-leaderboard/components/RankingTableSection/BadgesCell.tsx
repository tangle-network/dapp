import type { FC } from 'react';

import { BADGE_ICON_RECORD } from '../../constants';
import { BadgeEnum } from '../../types';
import BadgeWithTooltip from './BadgeWithTooltip';

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
