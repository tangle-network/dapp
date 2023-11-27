import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import cx from 'classnames';
import type { FC } from 'react';

import { BADGE_ICON_RECORD } from '../../constants';
import { BadgeEnum } from '../../types';

const BadgesCell: FC<{ badges: BadgeEnum[] }> = ({ badges }) => {
  return (
    <div className="flex flex-wrap gap-[2px]">
      {badges.map((badge, idx) => (
        <div
          key={idx}
          className={cx(
            'w-6 md:w-[30px] aspect-square rounded-full',
            'flex items-center justify-center',
            'bg-[rgba(31,29,43,0.1)]'
          )}
        >
          <Typography variant="mkt-body2">
            {BADGE_ICON_RECORD[badge]}
          </Typography>
        </div>
      ))}
    </div>
  );
};

export default BadgesCell;
