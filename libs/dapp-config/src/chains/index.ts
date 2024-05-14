import { EVMChainId } from '@webb-tools/dapp-types';

export * from './chain-config.js';
export * from './chain-config.interface.js';

export const LOCALNET_CHAIN_IDS = [
  EVMChainId.HermesLocalnet,
  EVMChainId.AthenaLocalnet,
  EVMChainId.DemeterLocalnet,
];

export const SELF_HOSTED_CHAIN_IDS = [];
