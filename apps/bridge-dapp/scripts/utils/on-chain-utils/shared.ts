import EVMChainId from '@webb-tools/dapp-types/src/EVMChainId';
import { zeroAddress } from '@webb-tools/dapp-types';
import { ICurrency } from '@webb-tools/dapp-config/on-chain-config/on-chain-config-base';

// Constants

export const LOCALNET_CHAIN_IDS = [
  EVMChainId.HermesLocalnet,
  EVMChainId.AthenaLocalnet,
  EVMChainId.DemeterLocalnet,
];

export const SELF_HOSTED_CHAIN_IDS = [
  EVMChainId.HermesOrbit,
  EVMChainId.AthenaOrbit,
  EVMChainId.DemeterOrbit,
];

export const DEFAULT_EVM_CURRENCY: ICurrency = {
  name: 'Localnet Ether',
  symbol: 'ETH',
  decimals: 18,
  address: zeroAddress,
};

// The default native currency index in the asset registry pallet
export const DEFAULT_NATIVE_INDEX = 0;
