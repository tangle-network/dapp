import { DEPOSIT_PATH, TRANSFER_PATH, WITHDRAW_PATH } from './paths';
import { ButtonProps, populateDocsUrl } from '@webb-tools/webb-ui-components';
import { WEBB_DOC_ROUTES_RECORD } from '@webb-tools/webb-ui-components/constants';

export * from '@webb-tools/webb-ui-components/constants';
export * from './signIn';
export * from './links';
export * from './paths';

export const BRIDGE_TABS = [
  DEPOSIT_PATH,
  WITHDRAW_PATH,
  TRANSFER_PATH,
] as const;

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
