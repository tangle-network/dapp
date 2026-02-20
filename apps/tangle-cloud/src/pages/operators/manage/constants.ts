import { GlobalLine, TimeLineIcon } from '@tangle-network/icons';
import { ReactElement, createElement } from 'react';

export enum SlashingTab {
  MY_PROPOSALS = 'My Proposals',
  AGAINST_ME = 'Against Me',
}

export const SLASHING_TAB_ICONS: ReactElement[] = [
  createElement(GlobalLine, { className: 'w-4 h-4 !fill-blue-50' }),
  createElement(TimeLineIcon, { className: 'w-4 h-4 !fill-yellow-100' }),
];

export const SLASHING_TABS = Object.values(SlashingTab);

export const MIN_DISPUTE_REASON_LENGTH = 20;
export const MIN_CANCEL_REASON_LENGTH = 8;

// 65-byte uncompressed ECDSA key => 0x + 130 hex chars.
export const ECDSA_PUBLIC_KEY_HEX_LENGTH = 132;
