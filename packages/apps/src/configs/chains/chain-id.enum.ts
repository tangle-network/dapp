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
export enum ChainId {
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

export enum EVMChain {
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

export const evmIdIntoInternalChainId = (evmId: number | string): ChainId => {
  switch (Number(evmId) as EVMChain) {
    case EVMChain.EthereumMainNet:
      return ChainId.EthereumMainNet;
    case EVMChain.Ropsten:
      return ChainId.Ropsten;
    case EVMChain.Rinkeby:
      return ChainId.Rinkeby;
    case EVMChain.Kovan:
      return ChainId.Kovan;
    case EVMChain.Goerli:
      return ChainId.Goerli;
    case EVMChain.Edgeware:
      return ChainId.Edgeware;
    case EVMChain.Beresheet:
      return ChainId.EdgewareTestNet;
    case EVMChain.HarmonyTestnet1:
      return ChainId.HarmonyTestnet1;
    case EVMChain.HarmonyTestnet0:
      return ChainId.HarmonyTestnet0;
    case EVMChain.HarmonyMainnet0:
      return ChainId.HarmonyMainnet0;
    case EVMChain.Ganache:
      return ChainId.Ganache;
    case EVMChain.Shiden:
      return ChainId.Shiden;
    case EVMChain.OptimismTestnet:
      return ChainId.OptimismTestnet;
    case EVMChain.ArbitrumTestnet:
      return ChainId.ArbitrumTestnet;
    case EVMChain.PolygonTestnet:
      return ChainId.PolygonTestnet;
  }
};

export const internalChainIdIntoEVMId = (chainId: ChainId | Number | String): EVMChain => {
  switch (Number(chainId) as ChainId) {
    case ChainId.Edgeware:
      return EVMChain.Edgeware;
    case ChainId.EdgewareTestNet:
      return EVMChain.Beresheet;
    case ChainId.EthereumMainNet:
      return EVMChain.EthereumMainNet;
    case ChainId.Rinkeby:
      return EVMChain.Rinkeby;
    case ChainId.Ropsten:
      return EVMChain.Ropsten;
    case ChainId.Kovan:
      return EVMChain.Kovan;
    case ChainId.Goerli:
      return EVMChain.Goerli;
    case ChainId.HarmonyTestnet0:
      return EVMChain.HarmonyTestnet0;
    case ChainId.HarmonyTestnet1:
      return EVMChain.HarmonyTestnet1;
    case ChainId.HarmonyMainnet0:
      return EVMChain.HarmonyMainnet0;
    case ChainId.Ganache:
      return EVMChain.Ganache;
    case ChainId.Shiden:
      return EVMChain.Shiden;
    case ChainId.OptimismTestnet:
      return EVMChain.OptimismTestnet;
    case ChainId.ArbitrumTestnet:
      return EVMChain.ArbitrumTestnet;
    case ChainId.PolygonTestnet:
      return EVMChain.PolygonTestnet;
    default:
      throw Error(`unsupported chain ${chainId}`);
  }
};

export const internalChainIdIntoSubstrateId = (chainId: ChainId | Number | String): number => {
  switch (Number(chainId) as ChainId) {
    case ChainId.Edgeware:
      return SubstrateChain.Edgeware;
    default:
      throw Error(`unsupported chain ${chainId}`);
  }
};

export const internalChainIdToChainId = (chainType: ChainType, internalId: ChainId) => {
  switch (chainType) {
    case ChainType.EVM:
      return internalChainIdIntoEVMId(internalId);
    case ChainType.Substrate:
      return internalChainIdIntoSubstrateId(internalId);
    // TODO: Handle other cases
    default:
      throw new Error('chainType not handled in internalChainIdToChainId');
  }
};
