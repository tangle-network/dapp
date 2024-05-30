export enum EVMChainId {
  /* Default EVM Chains on MetaMask */
  EthereumMainNet = 1,
  Goerli = 5,
  Sepolia = 11155111,
  Ganache = 1337,

  /* Added EVM Chains on MetaMask */
  Edgeware = 2021,
  HarmonyTestnet0 = 1666700000,
  HarmonyTestnet1 = 1666700001,
  Shiden = 336,
  OptimismTestnet = 420,
  ArbitrumTestnet = 421613,
  PolygonTestnet = 80001,
  MoonbaseAlpha = 1287,
  AvalancheFuji = 43113,
  ScrollSepolia = 534351,

  TangleLocalEVM = 3799,
  TangleTestnetEVM = 3799,
  TangleMainnetEVM = 5845,

  /** Local EVM */
  HermesLocalnet = 3884533462,
  AthenaLocalnet = 3884533461,
  DemeterLocalnet = 3884533463,
}

export default EVMChainId;
