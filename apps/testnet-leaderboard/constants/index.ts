import {
  SOCIAL_URLS_RECORD,
  WEBB_DOC_ROUTES_RECORD,
} from '@webb-tools/webb-ui-components/constants';
import populateDocsUrl from '@webb-tools/webb-ui-components/utils/populateDocsUrl';

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
  [BadgeEnum.ACTIVE_VALIDATOR]: '🟢',
  [BadgeEnum.BUG_REPORTER]: '🔎',
  [BadgeEnum.WRITER]: '📝',
} as const satisfies { [key in BadgeEnum]: string };

/** The second constant calculated in milliseconds. */
export const SECOND = 1000;

/** The minute constant calculated in milliseconds. */
export const MINUTE = SECOND * 60;

/** The hour constant calculated in milliseconds. */
export const HOUR = MINUTE * 60;

/** The day constant calculated in milliseconds. */
export const DAY = HOUR * 24;

/** Default pagination skip */
export const DEFAULT_SKIP = 0;

export const DEFAULT_LIMIT = 20;

export const END_DATE = process.env['TESTNET_LEADERBOARD_END_DATE']
  ? new Date(process.env['TESTNET_LEADERBOARD_END_DATE'])
  : null;

export const GUIDELINES_URL = process.env['TESTNET_LEADERBOARD_GUIDELINES_URL']
  ? process.env['TESTNET_LEADERBOARD_GUIDELINES_URL']
  : populateDocsUrl(WEBB_DOC_ROUTES_RECORD['tangle-network']['participate']);

export const REQUEST_POINTS_URL =
  process.env['TESTNET_LEADERBOARD_REQUEST_POINTS_URL'] // prettier-ignore
    ? process.env['TESTNET_LEADERBOARD_REQUEST_POINTS_URL']
    : SOCIAL_URLS_RECORD['discord'];

export const BACKEND_URL = process.env['TESTNET_LEADERBOARD_BACKEND_URL']
  ? process.env['TESTNET_LEADERBOARD_BACKEND_URL']
  : 'https://leaderboard-backend.tangle.tools';
