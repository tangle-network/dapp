import {
  DEPOSIT_PATH,
  TRANSFER_PATH,
  UNWRAP_PATH,
  WITHDRAW_PATH,
  WRAP_PATH,
} from './paths';

export * from '@webb-tools/webb-ui-components/constants';
export * from './signIn';
export * from './links';
export * from './paths';

export const BRIDGE_TABS = [
  DEPOSIT_PATH,
  WITHDRAW_PATH,
  TRANSFER_PATH,
] as const;

export const WRAPPER_TABS = [WRAP_PATH, UNWRAP_PATH] as const;
