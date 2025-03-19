import { BadgeEnum } from '../types/BadgeEnum';

export const BADGE_ICON_RECORD = {
  [BadgeEnum.LIQUID_STAKER]: '💧',
  [BadgeEnum.NATIVE_RESTAKER]: '🪙',
  [BadgeEnum.OPERATOR]: '🛠️',
  [BadgeEnum.RESTAKE_DELEGATOR]: '🤝',
  [BadgeEnum.RESTAKE_DEPOSITOR]: '💸',
  [BadgeEnum.VALIDATOR]: '🔐',
} as const satisfies Record<BadgeEnum, string>;
