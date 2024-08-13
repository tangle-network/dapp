import { HexString } from '@polkadot/util/types';

export type LsErc20TokenDef = {
  id: LsErc20TokenId;
  name: string;
  token: LsErc20Token;
  address: HexString;
  liquifierAdapterAddress: HexString;
  liquifierTgTokenAddress: HexString;
};

export enum LsErc20TokenId {
  Chainlink,
  TheGraph,
  Livepeer,
  Polygon,
}

export enum LsErc20Token {
  LINK,
  GRT,
  LPT,
  POL,
}

const ChainlinkErc20TokenDef: LsErc20TokenDef = {
  id: LsErc20TokenId.Chainlink,
  name: 'Chainlink',
  token: LsErc20Token.LINK,
  // TODO: Use Liquifier's testnet address if the environment is development.
  address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  // TODO: Use the actual Chainlink Liquifier Adapter address. This is likely deployed to a testnet (Tenderly?).
  liquifierAdapterAddress: '0x',
  liquifierTgTokenAddress: '0x',
};

const TheGraphErc20TokenDef: LsErc20TokenDef = {
  id: LsErc20TokenId.TheGraph,
  name: 'The Graph',
  token: LsErc20Token.GRT,
  // TODO: Use Liquifier's testnet address if the environment is development.
  address: '0xc944E90C64B2c07662A292be6244BDf05Cda44a7',
  // TODO: Use the actual Chainlink Liquifier Adapter address. This is likely deployed to a testnet (Tenderly?).
  liquifierAdapterAddress: '0x',
  liquifierTgTokenAddress: '0x',
};

const LivepeerErc20TokenDef: LsErc20TokenDef = {
  id: LsErc20TokenId.Livepeer,
  name: 'Livepeer',
  token: LsErc20Token.LPT,
  // TODO: Use Liquifier's testnet address if the environment is development.
  address: '0x58b6A8A3302369DAEc383334672404Ee733aB239',
  // TODO: Use the actual Chainlink Liquifier Adapter address. This is likely deployed to a testnet (Tenderly?).
  liquifierAdapterAddress: '0x',
  liquifierTgTokenAddress: '0x',
};

const PolygonErc20TokenDef: LsErc20TokenDef = {
  id: LsErc20TokenId.Polygon,
  name: 'Polygon',
  token: LsErc20Token.POL,
  // TODO: Use Liquifier's testnet address if the environment is development.
  address: '0x0D500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  // TODO: Use the actual Chainlink Liquifier Adapter address. This is likely deployed to a testnet (Tenderly?).
  liquifierAdapterAddress: '0x',
  liquifierTgTokenAddress: '0x',
};

export const LS_ERC20_TOKEN_MAP: Record<LsErc20TokenId, LsErc20TokenDef> = {
  [LsErc20TokenId.Chainlink]: ChainlinkErc20TokenDef,
  [LsErc20TokenId.TheGraph]: TheGraphErc20TokenDef,
  [LsErc20TokenId.Livepeer]: LivepeerErc20TokenDef,
  [LsErc20TokenId.Polygon]: PolygonErc20TokenDef,
};
