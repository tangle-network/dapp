import { CrossChainTimeUnit } from '../../utils/CrossChainTime';
import { StaticAssetPath } from '..';
import { LsErc20TokenId, LsProtocolId, LsToken } from './types';
import { LsErc20TokenDef } from './types';

const CHAINLINK: LsErc20TokenDef = {
  type: 'erc20',
  id: LsProtocolId.CHAINLINK,
  name: 'Chainlink',
  networkName: 'Ethereum Mainnet',
  // TODO: Add logo and link it here.
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_PHALA,
  token: LsToken.LINK,
  decimals: 18,
  // TODO: Use Liquifier's testnet address if the environment is development.
  address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  // TODO: Use the actual Chainlink Liquifier Adapter address. This is likely deployed to a testnet (Tenderly?).
  liquifierAdapterAddress: '0x',
  liquifierTgTokenAddress: '0x',
  timeUnit: CrossChainTimeUnit.DAY,
  unstakingPeriod: 7,
};

const THE_GRAPH: LsErc20TokenDef = {
  type: 'erc20',
  id: LsProtocolId.THE_GRAPH,
  name: 'The Graph',
  networkName: 'Ethereum Mainnet',
  // TODO: Add logo and link it here.
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_PHALA,
  token: LsToken.GRT,
  decimals: 18,
  // TODO: Use Liquifier's testnet address if the environment is development.
  address: '0xc944E90C64B2c07662A292be6244BDf05Cda44a7',
  // TODO: Use the actual Chainlink Liquifier Adapter address. This is likely deployed to a testnet (Tenderly?).
  liquifierAdapterAddress: '0x',
  liquifierTgTokenAddress: '0x',
  timeUnit: CrossChainTimeUnit.DAY,
  unstakingPeriod: 28,
};

const LIVEPEER: LsErc20TokenDef = {
  type: 'erc20',
  id: LsProtocolId.LIVEPEER,
  name: 'Livepeer',
  networkName: 'Ethereum Mainnet',
  // TODO: Add logo and link it here.
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_PHALA,
  token: LsToken.LPT,
  decimals: 18,
  // TODO: Use Liquifier's testnet address if the environment is development.
  address: '0x58b6A8A3302369DAEc383334672404Ee733aB239',
  // TODO: Use the actual Chainlink Liquifier Adapter address. This is likely deployed to a testnet (Tenderly?).
  liquifierAdapterAddress: '0x',
  liquifierTgTokenAddress: '0x',
  timeUnit: CrossChainTimeUnit.LIVEPEER_ROUND,
  unstakingPeriod: 7,
};

const POLYGON: LsErc20TokenDef = {
  type: 'erc20',
  id: LsProtocolId.POLYGON,
  name: 'Polygon',
  networkName: 'Ethereum Mainnet',
  // TODO: Add logo and link it here.
  logo: StaticAssetPath.LIQUID_STAKING_TOKEN_PHALA,
  token: LsToken.POL,
  decimals: 18,
  // TODO: Use Liquifier's testnet address if the environment is development.
  address: '0x0D500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  // TODO: Use the actual Chainlink Liquifier Adapter address. This is likely deployed to a testnet (Tenderly?).
  liquifierAdapterAddress: '0x',
  liquifierTgTokenAddress: '0x',
  timeUnit: CrossChainTimeUnit.POLYGON_CHECKPOINT,
  unstakingPeriod: 82,
};

export const LS_ERC20_TOKEN_MAP: Record<LsErc20TokenId, LsErc20TokenDef> = {
  [LsProtocolId.CHAINLINK]: CHAINLINK,
  [LsProtocolId.THE_GRAPH]: THE_GRAPH,
  [LsProtocolId.LIVEPEER]: LIVEPEER,
  [LsProtocolId.POLYGON]: POLYGON,
};
