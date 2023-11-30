import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import capitalize from 'lodash/capitalize';
import type { FC } from 'react';

import { BADGE_ICON_RECORD } from '../../constants';
import { BadgeEnum } from '../../types';

const BADGE_TO_NAME = {
  [BadgeEnum.CREATOR]: 'Content Creator',
  [BadgeEnum.GOVERNANCE]: 'Governance Guardian',
  [BadgeEnum.SPECIALIST]: 'Tx Specialist',
} as const satisfies Partial<{
  [key in BadgeEnum]: string;
}>;

const getBadgeName = (badge: string) => {
  if (badge in BADGE_TO_NAME) {
    return BADGE_TO_NAME[badge as keyof typeof BADGE_TO_NAME];
  }

  return null;
};

const Badges = () => {
  return (
    <div className="flex flex-wrap justify-center gap-1">
      {Object.entries(BADGE_ICON_RECORD).map(([badge, icon], idx) => {
        const name = getBadgeName(badge) ?? badge;
        const fmtName = name.split('_').map(capitalize).join(' ');

        return (
          <Badge
            key={`${badge}-${idx}`}
            icon={icon}
            name={fmtName}
            shorthand={capitalize(badge)}
          />
        );
      })}
    </div>
  );
};

export default Badges;

/** @internal */
const Badge: FC<{ icon: string; name: string; shorthand?: string }> = ({
  icon,
  name,
  shorthand,
}) => {
  return (
    <>
      <Typography
        variant="mkt-body2"
        fw="bold"
        className="hidden md:block bg-[rgba(31,29,43,0.1)] px-2 py-[2px] rounded-full mt-1"
      >
        {icon} {name}
      </Typography>
      <Typography
        variant="mkt-body2"
        fw="bold"
        className="block md:hidden bg-[rgba(31,29,43,0.1)] px-2 py-[2px] rounded-full mt-1"
      >
        {icon} {shorthand || name}
      </Typography>
    </>
  );
};
