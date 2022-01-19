import { ChainId } from '@webb-dapp/apps/configs/chains';
import { RelayerConfig, WebbRelayerBuilder } from '@webb-dapp/react-environment/webb-context/relayer';

let builder: WebbRelayerBuilder | null = null;
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

export function relayerNameToChainId(name: string): ChainId {
  switch (name) {
    case 'beresheet':
      return ChainId.EdgewareTestNet;
    case 'harmonytestnet1':
      return ChainId.HarmonyTestnet1;
    case 'harmonytestnet0':
      return ChainId.HarmonyTestnet0;
    case 'harmonymainnet0':
      return ChainId.HarmonyMainnet0;
    case 'ganache':
      return ChainId.Ganache;
    case 'webb':
    case 'edgeware':
    case 'hedgeware':
      break;
    case 'ropsten':
      return ChainId.Ropsten;
    case 'rinkeby':
      return ChainId.Rinkeby;
    case 'goerli':
      return ChainId.Goerli;
    case 'kovan':
      return ChainId.Kovan;
    case 'shiden':
      return ChainId.Shiden;
    case 'optimismtestnet':
      return ChainId.OptimismTestnet;
    case 'arbitrumtestnet':
      return ChainId.ArbitrumTestnet;
    case 'polygontestnet':
      return ChainId.PolygonTestnet;
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
}

export function chainIdToRelayerName(id: ChainId): string {
  switch (id) {
    case ChainId.Edgeware:
      return RelayerChainName.Edgeware;
    case ChainId.EdgewareTestNet:
      return RelayerChainName.Beresheet;
    case ChainId.EdgewareLocalNet:
      break;
    case ChainId.EthereumMainNet:
      break;
    case ChainId.Rinkeby:
      return RelayerChainName.Rinkeby;
    case ChainId.Ropsten:
      return RelayerChainName.Ropsten;
    case ChainId.Kovan:
      return RelayerChainName.Kovan;
    case ChainId.Goerli:
      return RelayerChainName.Goerli;
    case ChainId.HarmonyTestnet0:
      return RelayerChainName.HarmonyTestnet0;
    case ChainId.HarmonyTestnet1:
      return RelayerChainName.HarmonyTestnet1;
    case ChainId.HarmonyMainnet0:
      return RelayerChainName.HarmonyMainnet0;
    case ChainId.Shiden:
      return RelayerChainName.Shiden;
    case ChainId.OptimismTestnet:
      return RelayerChainName.OptimismTestnet;
    case ChainId.ArbitrumTestnet:
      return RelayerChainName.ArbitrumTestnet;
    case ChainId.PolygonTestnet:
      return RelayerChainName.PolygonTestnet;
  }
  throw new Error(`unhandled Chain id ${id}`);
}

export async function getWebbRelayer() {
  if (!builder) {
    builder = await WebbRelayerBuilder.initBuilder(relayerConfig, (name, basedOn) => {
      if (basedOn === 'evm') {
        try {
          return relayerNameToChainId(name);
        } catch (e) {
          return null;
        }
      }

      if (basedOn === 'substrate') {
        // TODO: fix this
        return ChainId.WebbDevelopment;
      }
      return null;
    });
  }
  return builder;
}
