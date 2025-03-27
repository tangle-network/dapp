import { BLOCK_TIME_MS } from '@tangle-network/dapp-config';

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

export const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export const BLOCK_COUNT_IN_ONE_DAY = Math.floor(ONE_DAY_IN_MS / BLOCK_TIME_MS);

export const BLOCK_COUNT_IN_SEVEN_DAYS = BLOCK_COUNT_IN_ONE_DAY * 7;
