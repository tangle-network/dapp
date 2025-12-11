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

export enum RoleFilterEnum {
  OPERATOR = 'OPERATOR',
  RESTAKER = 'RESTAKER',
  DEVELOPER = 'DEVELOPER',
  CUSTOMER = 'CUSTOMER',
}

export const ROLE_FILTER_LABELS: Record<RoleFilterEnum, string> = {
  [RoleFilterEnum.OPERATOR]: 'Operator',
  [RoleFilterEnum.RESTAKER]: 'Restaker',
  [RoleFilterEnum.DEVELOPER]: 'Developer',
  [RoleFilterEnum.CUSTOMER]: 'Customer',
};

export const ROLE_FILTER_ICONS: Record<RoleFilterEnum, string> = {
  [RoleFilterEnum.OPERATOR]: '🛠️',
  [RoleFilterEnum.RESTAKER]: '💰',
  [RoleFilterEnum.DEVELOPER]: '🏗️',
  [RoleFilterEnum.CUSTOMER]: '💼',
};

export const ROLE_TO_BADGES: Record<RoleFilterEnum, BadgeEnum[]> = {
  [RoleFilterEnum.OPERATOR]: [BadgeEnum.OPERATOR],
  [RoleFilterEnum.RESTAKER]: [
    BadgeEnum.RESTAKE_DEPOSITOR,
    BadgeEnum.RESTAKE_DELEGATOR,
    BadgeEnum.LIQUID_STAKER,
  ],
  [RoleFilterEnum.DEVELOPER]: [BadgeEnum.BLUEPRINT_OWNER],
  [RoleFilterEnum.CUSTOMER]: [BadgeEnum.JOB_CALLER],
};

export const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

// Envio uses timestamps instead of block numbers for filtering
export const SECONDS_IN_ONE_DAY = 24 * 60 * 60;
export const SEVEN_DAYS_IN_SECONDS = 7 * SECONDS_IN_ONE_DAY;
