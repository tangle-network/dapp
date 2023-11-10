import { ButtonProps, populateDocsUrl } from '@webb-tools/webb-ui-components';
import { WEBB_DOC_ROUTES_RECORD } from '@webb-tools/webb-ui-components/constants';

export * from '@webb-tools/webb-ui-components/constants';

export * from './signIn';
export * from './links';

export const BRIDGE_PATH = 'bridge';
export const WRAP_UNWRAP_PATH = 'wrap-unwrap';
export const NOTE_ACCOUNT_PATH = 'account';
export const ECOSYSTEM_PATH = 'ecosystem';

export const DEPOSIT_PATH = 'deposit';
export const TRANSFER_PATH = 'transfer';
export const WITHDRAW_PATH = 'withdraw';

export const SELECT_SOURCE_CHAIN_PATH = 'select-source-chain';
export const SELECT_DESTINATION_CHAIN_PATH = 'select-destination-chain';
export const SELECT_TOKEN_PATH = 'select-token';
export const SELECT_SHIELDED_POOL_PATH = 'select-shielded-pool';
export const SELECT_RELAYER_PATH = 'select-relayer';

/** Key for source chain query params */
export const SOURCE_CHAIN_KEY = 'source';

/** Key for destination chain query params */
export const DEST_CHAIN_KEY = 'dest';

/** Key for fungible currency query param */
export const TOKEN_KEY = 'token';

/** Key for wrappable currency query param */
export const POOL_KEY = 'pool';

/** Key for fixed amount or custom amount */
export const IS_CUSTOM_AMOUNT_KEY = 'isCustomAmount';

/** Key for transaction amount query param */
export const AMOUNT_KEY = 'amount';

/** Key for has reund query param */
export const HAS_REFUND_KEY = 'hasRefund';

/** Key for refund recipient query param */
export const REFUND_RECIPIENT_KEY = 'refundRecipient';

/** Key for recipient query param */
export const RECIPIENT_KEY = 'recipient';

/** Key for no relayer query params */
export const NO_RELAYER_KEY = 'noRelayer';

/** Key for relayer endpoint query param */
export const RELAYER_ENDPOINT_KEY = 'relayer';

export const BRIDGE_TABS = [
  DEPOSIT_PATH,
  TRANSFER_PATH,
  WITHDRAW_PATH,
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
