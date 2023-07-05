import { EVMChainId } from '@webb-tools/dapp-types';

export * from './chain-config';
export * from './chain-config.interface';

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
