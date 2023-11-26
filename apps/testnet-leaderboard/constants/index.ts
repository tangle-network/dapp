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
