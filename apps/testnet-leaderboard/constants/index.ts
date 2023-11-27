import { BadgeEnum } from '../types';

export const BADGE_ICON_RECORD = {
  [BadgeEnum.AUTHORITY]: '👑',
  [BadgeEnum.CREATOR]: '🎨',
  [BadgeEnum.DEVELOPER]: '🛠️',
  [BadgeEnum.GOVERNANCE]: '🏛️',
  [BadgeEnum.INNOVATOR]: '💡',
  [BadgeEnum.RELAYER]: '📡',
  [BadgeEnum.VALIDATOR]: '🔐',
  [BadgeEnum.SPECIALIST]: '🔁',
  [BadgeEnum.USER]: '👤',
} as const satisfies Partial<{ [key in BadgeEnum]: string }>;

/** The second constant calculated in milliseconds. */
export const SECOND = 1000;

/** The minute constant calculated in milliseconds. */
export const MINUTE = SECOND * 60;

/** The hour constant calculated in milliseconds. */
export const HOUR = MINUTE * 60;

/** The day constant calculated in milliseconds. */
export const DAY = HOUR * 24;

export const END_DATE = process.env['TESTNET_LEADERBOARD_END_DATE']
  ? new Date(process.env['TESTNET_LEADERBOARD_END_DATE'])
  : null;
