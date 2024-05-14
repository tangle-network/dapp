import {
  DEPOSIT_PATH,
  TRANSFER_PATH,
  UNWRAP_PATH,
  WITHDRAW_PATH,
  WRAP_PATH,
} from './paths.js';
import { ButtonProps, populateDocsUrl } from '@webb-tools/webb-ui-components';
import { WEBB_DOC_ROUTES_RECORD } from '@webb-tools/webb-ui-components/constants/index.js';

export * from '@webb-tools/webb-ui-components/constants/index.js';
export * from './signIn.js';
export * from './links.js';
export * from './paths.js';

export const BRIDGE_TABS = [
  DEPOSIT_PATH,
  WITHDRAW_PATH,
  TRANSFER_PATH,
] as const;

export const WRAPPER_TABS = [WRAP_PATH, UNWRAP_PATH] as const;

export const ACTION_BUTTON_PROPS: ButtonProps[] = [
  {
    children: 'Learn more',
    variant: 'secondary',
    isFullWidth: true,
    href: populateDocsUrl(
      WEBB_DOC_ROUTES_RECORD.projects['hubble-bridge'].overview
    ),
  },
];
