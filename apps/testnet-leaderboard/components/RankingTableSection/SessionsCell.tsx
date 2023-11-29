import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import type { FC } from 'react';

import { BADGE_ICON_RECORD } from '../../constants';
import BadgeWithTooltip from './BadgeWithTooltip';
import type { SessionsType } from './types';
import { isBadgeEnum } from './utils';

const SessionsCell: FC<{ sessions: SessionsType }> = ({ sessions }) => {
  if (sessions == null) {
    return (
      <Typography variant="mkt-small-caps" fw="bold" ta="center">
        -
      </Typography>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {Object.entries(sessions).map(([badge, sessions], idx) => {
        if (sessions.length === 0) {
          return null;
        }

        return (
          <div className="flex items-center gap-1" key={`${badge}-${idx}`}>
            <BadgeWithTooltip
              badge={badge}
              emoji={isBadgeEnum(badge) ? BADGE_ICON_RECORD[badge] : '❔'}
            />

            <Typography variant="mkt-caption" fw="semibold" ta="center">
              {sessions.length}
            </Typography>
          </div>
        );
      })}
    </div>
  );
};

export default SessionsCell;
