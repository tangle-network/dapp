// must match u16 in rust
export enum ChainType {
  EVM = 0x0100,
  Substrate = 0x0200,
  PolkadotRelayChain = 0x0301,
  KusamaRelayChain = 0x0302,
  PolkadotParachain = 0x0310,
  KusamaParachain = 0x0311,
}

export interface ChainTypeId {
  chainType: ChainType;
  chainId: EVMChainId | SubstrateChainId;
}

export enum SubstrateChainId {
  Webb = 1,
  Edgeware = 7,
}

export enum PolkadotRelayChain {
  Mainnet = 0,
}

export enum KusamaRelayChain {
  Mainnet = 2,
}

// INTERNAL CHAIN IDS
export enum InternalChainId {
  Edgeware,
  EdgewareTestNet,
  EdgewareLocalNet,
  EthereumMainNet,
  Rinkeby,
  Ropsten,
  Kovan,
  Goerli,
  HarmonyTestnet1,
  HarmonyTestnet0,
  HarmonyMainnet0,
  Ganache,
  Shiden,
  OptimismTestnet,
  ArbitrumTestnet,
  PolygonTestnet,
  WebbDevelopment,
  HermesLocalnet,
  AthenaLocalnet,
}

export enum EVMChainId {
  /*Default EVM Chains on MetaMask*/
  EthereumMainNet = 1,
  Ropsten = 3,
  Rinkeby = 4,
  Kovan = 42,
  Goerli = 5,
  Ganache = 1337,

  /*Added EVM Chains on MetaMask*/
  Edgeware = 2021,
  Beresheet = 2022,
  HarmonyTestnet0 = 1666700000,
  HarmonyTestnet1 = 1666700001,
  HarmonyMainnet0 = 1666600000,
  Shiden = 336,
  OptimismTestnet = 69,
  ArbitrumTestnet = 421611,
  PolygonTestnet = 80001,
  HermesLocalnet = 5001,
  AthenaLocalnet = 5002,
}
