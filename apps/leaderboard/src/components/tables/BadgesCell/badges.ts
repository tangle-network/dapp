export enum BadgeEnum {
  VALIDATOR = 'VALIDATOR',
  RESTAKE_DEPOSITOR = 'RESTAKE_DEPOSITOR',
  RESTAKE_DELEGATOR = 'RESTAKE_DELEGATOR',
  LIQUID_STAKER = 'LIQUID_STAKER',
  NATIVE_RESTAKER = 'NATIVE_RESTAKER',
  OPERATOR = 'OPERATOR',
  BLUEPRINT_OWNER = 'BLUEPRINT_OWNER',
  SERVICE_PROVIDER = 'SERVICE_PROVIDER',
  JOB_CALLER = 'JOB_CALLER',
}

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
