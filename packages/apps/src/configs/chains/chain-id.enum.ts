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
  WebbDevelopment,
}

export enum WebbEVMChain {
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
}

export const evmIdIntoChainId = (evmId: number | string): ChainId => {
  switch (Number(evmId) as WebbEVMChain) {
    case WebbEVMChain.EthereumMainNet:
      return ChainId.EthereumMainNet;
    case WebbEVMChain.Ropsten:
      return ChainId.Ropsten;
    case WebbEVMChain.Rinkeby:
      return ChainId.Rinkeby;
    case WebbEVMChain.Kovan:
      return ChainId.Kovan;
    case WebbEVMChain.Goerli:
      return ChainId.Goerli;
    case WebbEVMChain.Edgeware:
      return ChainId.Edgeware;
    case WebbEVMChain.Beresheet:
      return ChainId.EdgewareTestNet;
    case WebbEVMChain.HarmonyTestnet1:
      return ChainId.HarmonyTestnet1;
    case WebbEVMChain.HarmonyTestnet0:
      return ChainId.HarmonyTestnet0;
    case WebbEVMChain.HarmonyMainnet0:
      return ChainId.HarmonyMainnet0;
    case WebbEVMChain.Ganache:
      return ChainId.Ganache;
    case WebbEVMChain.Shiden:
      return ChainId.Shiden;
    case WebbEVMChain.OptimismTestnet:
      return ChainId.OptimismTestnet;
    case WebbEVMChain.ArbitrumTestnet:
      return ChainId.ArbitrumTestnet;
  }
};

export const chainIdIntoEVMId = (chainId: ChainId | Number | String): WebbEVMChain => {
  switch (Number(chainId) as ChainId) {
    case ChainId.Edgeware:
      return WebbEVMChain.Edgeware;
    case ChainId.EdgewareTestNet:
      return WebbEVMChain.Beresheet;
    case ChainId.EthereumMainNet:
      return WebbEVMChain.EthereumMainNet;
    case ChainId.Rinkeby:
      return WebbEVMChain.Rinkeby;
    case ChainId.Ropsten:
      return WebbEVMChain.Ropsten;
    case ChainId.Kovan:
      return WebbEVMChain.Kovan;
    case ChainId.Goerli:
      return WebbEVMChain.Goerli;
    case ChainId.HarmonyTestnet0:
      return WebbEVMChain.HarmonyTestnet0;
    case ChainId.HarmonyTestnet1:
      return WebbEVMChain.HarmonyTestnet1;
    case ChainId.HarmonyMainnet0:
      return WebbEVMChain.HarmonyMainnet0;
    case ChainId.Ganache:
      return WebbEVMChain.Ganache;
    case ChainId.Shiden:
      return WebbEVMChain.Shiden;
    case ChainId.OptimismTestnet:
      return WebbEVMChain.OptimismTestnet;
    case ChainId.ArbitrumTestnet:
      return WebbEVMChain.ArbitrumTestnet;
    default:
      throw Error(`unsupported chain ${chainId}`);
  }
};
