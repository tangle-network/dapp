import { FC } from 'react';
import cx from 'classnames';

import { BadgeType } from './types';

const badgeIcons: { [key in BadgeType]: string } = {
  creator: '🎨',
  developer: '🛠️',
  governance: '🏛️',
  innovator: '💡',
  relayer: '📡',
  validator: '🔐',
  specialist: '🔁',
};

export const BadgesCell: FC<{ badges: BadgeType[] }> = ({ badges }) => {
  return (
    <div className="flex flex-wrap gap-[2px]">
      {badges.map((badge, idx) => (
        <div
          key={idx}
          className={cx(
            'w-[24px] md:w-[30px] aspect-square rounded-full',
            'flex items-center justify-center',
            'bg-[rgba(31,29,43,0.1)]'
          )}
        >
          {badgeIcons[badge]}
        </div>
      ))}
    </div>
  );
};
