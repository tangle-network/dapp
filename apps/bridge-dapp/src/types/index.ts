// Shared types for the bridge dapp

import { DEST_CHAIN_KEY, SOURCE_CHAIN_KEY } from '../constants';

export type QueryParamsType = {
  [key in typeof SOURCE_CHAIN_KEY | typeof DEST_CHAIN_KEY]: string | undefined;
};
