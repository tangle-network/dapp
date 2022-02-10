// must match u16 in rust
export enum ChainType {
  EVM = 0x0100,
  Substrate = 0x0200,
  PolkadotRelayChain = 0x0301,
  KusamaRelayChain = 0x0302,
  PolkadotParachain = 0x0310,
  KusamaParachain = 0x0311,
}

export enum SubstrateChain {
  Edgeware = 7,
}

export enum PolkadotRelayChain {
  Mainnet = 0,
}

export enum KusamaRelayChain {
  Mainnet = 2,
}

export enum KusamaParachain {
  Shiden = 2007,
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
}

export const evmIdIntoInternalChainId = (evmId: number | string): InternalChainId => {
  switch (Number(evmId) as EVMChainId) {
    case EVMChainId.EthereumMainNet:
      return InternalChainId.EthereumMainNet;
    case EVMChainId.Ropsten:
      return InternalChainId.Ropsten;
    case EVMChainId.Rinkeby:
      return InternalChainId.Rinkeby;
    case EVMChainId.Kovan:
      return InternalChainId.Kovan;
    case EVMChainId.Goerli:
      return InternalChainId.Goerli;
    case EVMChainId.Edgeware:
      return InternalChainId.Edgeware;
    case EVMChainId.Beresheet:
      return InternalChainId.EdgewareTestNet;
    case EVMChainId.HarmonyTestnet1:
      return InternalChainId.HarmonyTestnet1;
    case EVMChainId.HarmonyTestnet0:
      return InternalChainId.HarmonyTestnet0;
    case EVMChainId.HarmonyMainnet0:
      return InternalChainId.HarmonyMainnet0;
    case EVMChainId.Ganache:
      return InternalChainId.Ganache;
    case EVMChainId.Shiden:
      return InternalChainId.Shiden;
    case EVMChainId.OptimismTestnet:
      return InternalChainId.OptimismTestnet;
    case EVMChainId.ArbitrumTestnet:
      return InternalChainId.ArbitrumTestnet;
    case EVMChainId.PolygonTestnet:
      return InternalChainId.PolygonTestnet;
  }
};

export const internalChainIdIntoEVMId = (chainId: InternalChainId | Number | String): EVMChainId => {
  switch (Number(chainId) as InternalChainId) {
    case InternalChainId.Edgeware:
      return EVMChainId.Edgeware;
    case InternalChainId.EdgewareTestNet:
      return EVMChainId.Beresheet;
    case InternalChainId.EthereumMainNet:
      return EVMChainId.EthereumMainNet;
    case InternalChainId.Rinkeby:
      return EVMChainId.Rinkeby;
    case InternalChainId.Ropsten:
      return EVMChainId.Ropsten;
    case InternalChainId.Kovan:
      return EVMChainId.Kovan;
    case InternalChainId.Goerli:
      return EVMChainId.Goerli;
    case InternalChainId.HarmonyTestnet0:
      return EVMChainId.HarmonyTestnet0;
    case InternalChainId.HarmonyTestnet1:
      return EVMChainId.HarmonyTestnet1;
    case InternalChainId.HarmonyMainnet0:
      return EVMChainId.HarmonyMainnet0;
    case InternalChainId.Ganache:
      return EVMChainId.Ganache;
    case InternalChainId.Shiden:
      return EVMChainId.Shiden;
    case InternalChainId.OptimismTestnet:
      return EVMChainId.OptimismTestnet;
    case InternalChainId.ArbitrumTestnet:
      return EVMChainId.ArbitrumTestnet;
    case InternalChainId.PolygonTestnet:
      return EVMChainId.PolygonTestnet;
    default:
      throw Error(`unsupported chain ${chainId}`);
  }
};

export const internalChainIdIntoSubstrateId = (chainId: InternalChainId | Number | String): number => {
  switch (Number(chainId) as InternalChainId) {
    case InternalChainId.Edgeware:
      return SubstrateChain.Edgeware;
    default:
      throw Error(`unsupported chain ${chainId}`);
  }
};

export const internalChainIdToChainId = (chainType: ChainType, internalId: InternalChainId) => {
  switch (chainType) {
    case ChainType.EVM:
      return internalChainIdIntoEVMId(internalId);
    case ChainType.Substrate:
      return internalChainIdIntoSubstrateId(internalId);
    default:
      throw new Error('chainType not handled in internalChainIdToChainId');
  }
};
