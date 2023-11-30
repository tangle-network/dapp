import { BadgeEnum } from '../../types';

export function isBadgeEnum(badge: string): badge is BadgeEnum {
  return Object.values(BadgeEnum).includes(badge as BadgeEnum);
}
