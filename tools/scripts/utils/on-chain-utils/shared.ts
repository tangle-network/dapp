import EVMChainId from '@webb-tools/dapp-types/src/EVMChainId';
import { zeroAddress } from '@webb-tools/dapp-types';

// Constants

export const LOCALNET_CHAIN_IDS = [
  EVMChainId.HermesLocalnet,
  EVMChainId.AthenaLocalnet,
  EVMChainId.DemeterLocalnet,
] as const;

export const SELF_HOSTED_CHAIN_IDS = [] as const;

export const DEFAULT_EVM_CURRENCY = {
  name: 'Localnet Ether',
  symbol: 'ETH',
  decimals: 18,
  address: zeroAddress,
} as const;

// The default native currency index in the asset registry pallet
export const DEFAULT_NATIVE_INDEX = 0 as const;

// the default decimals
export const DEFAULT_DECIMALS = 18 as const;
