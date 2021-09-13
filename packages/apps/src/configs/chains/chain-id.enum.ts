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
  HarmonyTest0,
  HarmonyTest1,
  Ganache,
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
  HarmonyTest0 = 1666700000,
  HarmonyTest1 = 1666700001,
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
    case WebbEVMChain.HarmonyTest0:
      return ChainId.HarmonyTest0;
    case WebbEVMChain.HarmonyTest1:
      return ChainId.HarmonyTest1;
    case WebbEVMChain.Ganache:
      return ChainId.Ganache;
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
    case ChainId.HarmonyTestnet1:
      return WebbEVMChain.HarmonyTest0;
    case ChainId.HarmonyTest0:
      return WebbEVMChain.HarmonyTest0;
    case ChainId.HarmonyTest1:
      return WebbEVMChain.HarmonyTest1;
    case ChainId.Ganache:
      return WebbEVMChain.Ganache;
    default:
      throw Error(`unsupported chain ${chainId}`);
  }
};
