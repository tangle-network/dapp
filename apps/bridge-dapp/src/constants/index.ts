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

/** Key for source chain query params */
export const SOURCE_CHAIN_KEY = 'source';

/** Key for destination chain query params */
export const DEST_CHAIN_KEY = 'dest';

/** Key for fungible currency query param */
export const TOKEN_KEY = 'token';

/** Key for wrappable currency query param */
export const POOL_KEY = 'pool';

/** Key for transaction amount query param */
export const AMOUNT_KEY = 'amount';

export const BRIDGE_TABS = [DEPOSIT_PATH, TRANSFER_PATH, WITHDRAW_PATH];
