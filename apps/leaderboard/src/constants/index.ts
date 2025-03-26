import { BadgeEnum } from '../types/BadgeEnum';

export const BADGE_ICON_RECORD = {
  [BadgeEnum.LIQUID_STAKER]: '💧',
  [BadgeEnum.NATIVE_RESTAKER]: '💎',
  [BadgeEnum.OPERATOR]: '🛠️',
  [BadgeEnum.RESTAKE_DELEGATOR]: '💰',
  [BadgeEnum.RESTAKE_DEPOSITOR]: '💸',
  [BadgeEnum.VALIDATOR]: '🔐',
  [BadgeEnum.BLUEPRINT_OWNER]: '🏗️',
  [BadgeEnum.SERVICE_PROVIDER]: '💻',
  [BadgeEnum.JOB_CALLER]: '💼',
} as const satisfies Record<BadgeEnum, string>;
