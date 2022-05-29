import { AppConfig, InternalChainId, RelayerConfig, WebbRelayerManagerFactory } from '@webb-dapp/api-providers';

let relayerManagerFactory: WebbRelayerManagerFactory | null = null;
export const relayerConfig: RelayerConfig[] = [
  {
    endpoint: 'http://localhost:9955',
  },
  {
    endpoint: 'https://relayer.nepoche.com',
  },
  {
    endpoint: 'https://relayer.webb.tools',
  },
  {
    endpoint: 'https://webb.pops.one',
  },
  {
    endpoint: 'https://relayer.bldnodes.org',
  },
];

export function relayerSubstrateNameToChainId(name: string): InternalChainId {
  switch (name) {
    case 'localnode':
      return InternalChainId.ProtocolSubstrateStandalone;
    case 'webbeggnet':
      return InternalChainId.EggStandalone;
  }

  throw new Error('unhandled relayed chain name  ' + name);
}

export function relayerNameToChainId(name: string): InternalChainId {
  switch (name) {
    case 'beresheet':
      return InternalChainId.EdgewareTestNet;
    case 'harmonytestnet1':
      return InternalChainId.HarmonyTestnet1;
    case 'harmonytestnet0':
      return InternalChainId.HarmonyTestnet0;
    case 'harmonymainnet0':
      return InternalChainId.HarmonyMainnet0;
    case 'ganache':
      return InternalChainId.Ganache;
    case 'webb':
      break;
    case 'ropsten':
      return InternalChainId.Ropsten;
    case 'rinkeby':
      return InternalChainId.Rinkeby;
    case 'goerli':
      return InternalChainId.Goerli;
    case 'kovan':
      return InternalChainId.Kovan;
    case 'shiden':
      return InternalChainId.Shiden;
    case 'optimismtestnet':
      return InternalChainId.OptimismTestnet;
    case 'arbitrumtestnet':
      return InternalChainId.ArbitrumTestnet;
    case 'polygontestnet':
      return InternalChainId.PolygonTestnet;
    case 'hermes':
      return InternalChainId.HermesLocalnet;
    case 'athena':
      return InternalChainId.AthenaLocalnet;
  }

  throw new Error('unhandled relayed chain name  ' + name);
}

enum RelayerChainName {
  Edgeware = 'edgeware',
  Webb = 'webb',
  Ganache = 'ganache',
  Beresheet = 'beresheet',
  HarmonyTestnet0 = 'harmonytestnet0',
  HarmonyTestnet1 = 'harmonytestnet1',
  HarmonyMainnet0 = 'harmonymainnet0',
  Ropsten = 'ropsten',
  Rinkeby = 'rinkeby',
  Goerli = 'goerli',
  Kovan = 'kovan',
  Shiden = 'shiden',
  OptimismTestnet = 'optimismtestnet',
  ArbitrumTestnet = 'arbitrumtestnet',
  PolygonTestnet = 'polygontestnet',
  HermesLocalnet = 'hermes',
  AthenaLocalnet = 'athena',
  ProtocolSubstrateStandalone = 'localnode',
  WebbEggnet = 'webbeggnet',
}

export function chainIdToRelayerName(id: InternalChainId): string {
  switch (id) {
    case InternalChainId.Edgeware:
      return RelayerChainName.Edgeware;
    case InternalChainId.EdgewareTestNet:
      return RelayerChainName.Beresheet;
    case InternalChainId.EdgewareLocalNet:
      break;
    case InternalChainId.EthereumMainNet:
      break;
    case InternalChainId.Rinkeby:
      return RelayerChainName.Rinkeby;
    case InternalChainId.Ropsten:
      return RelayerChainName.Ropsten;
    case InternalChainId.Kovan:
      return RelayerChainName.Kovan;
    case InternalChainId.Goerli:
      return RelayerChainName.Goerli;
    case InternalChainId.HarmonyTestnet0:
      return RelayerChainName.HarmonyTestnet0;
    case InternalChainId.HarmonyTestnet1:
      return RelayerChainName.HarmonyTestnet1;
    case InternalChainId.HarmonyMainnet0:
      return RelayerChainName.HarmonyMainnet0;
    case InternalChainId.Shiden:
      return RelayerChainName.Shiden;
    case InternalChainId.OptimismTestnet:
      return RelayerChainName.OptimismTestnet;
    case InternalChainId.ArbitrumTestnet:
      return RelayerChainName.ArbitrumTestnet;
    case InternalChainId.PolygonTestnet:
      return RelayerChainName.PolygonTestnet;
    case InternalChainId.HermesLocalnet:
      return RelayerChainName.HermesLocalnet;
    case InternalChainId.AthenaLocalnet:
      return RelayerChainName.AthenaLocalnet;
    case InternalChainId.ProtocolSubstrateStandalone:
      return RelayerChainName.ProtocolSubstrateStandalone;
    case InternalChainId.EggStandalone:
      return RelayerChainName.WebbEggnet;
  }
  throw new Error(`unhandled Chain id ${id}`);
}

export async function getRelayerManagerFactory(appConfig: AppConfig) {
  if (!relayerManagerFactory) {
    relayerManagerFactory = await WebbRelayerManagerFactory.init(
      relayerConfig,
      (name, basedOn) => {
        try {
          return basedOn === 'evm' ? relayerNameToChainId(name) : relayerSubstrateNameToChainId(name);
        } catch (e) {
          return null;
        }
      },
      appConfig
    );
  }
  return relayerManagerFactory;
}
