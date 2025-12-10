export enum BadgeEnum {
  RESTAKE_DEPOSITOR = 'RESTAKE_DEPOSITOR',
  RESTAKE_DELEGATOR = 'RESTAKE_DELEGATOR',
  LIQUID_STAKER = 'LIQUID_STAKER',
  OPERATOR = 'OPERATOR',
  BLUEPRINT_OWNER = 'BLUEPRINT_OWNER',
  SERVICE_PROVIDER = 'SERVICE_PROVIDER',
  JOB_CALLER = 'JOB_CALLER',
}

export const BADGE_ICON_RECORD = {
  [BadgeEnum.LIQUID_STAKER]: '💧',
  [BadgeEnum.OPERATOR]: '🛠️',
  [BadgeEnum.RESTAKE_DELEGATOR]: '💰',
  [BadgeEnum.RESTAKE_DEPOSITOR]: '💸',
  [BadgeEnum.BLUEPRINT_OWNER]: '🏗️',
  [BadgeEnum.SERVICE_PROVIDER]: '💻',
  [BadgeEnum.JOB_CALLER]: '💼',
} as const satisfies Record<BadgeEnum, string>;

export const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

// Envio uses timestamps instead of block numbers for filtering
export const SECONDS_IN_ONE_DAY = 24 * 60 * 60;
export const SEVEN_DAYS_IN_SECONDS = 7 * SECONDS_IN_ONE_DAY;
