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
];

export function relayerNameToChainId(name: string): ChainId {
  switch (name) {
    case 'beresheet':
      return ChainId.EdgewareTestNet;
    case 'harmonytestnet1':
      return ChainId.HarmonyTestnet1;
    case 'harmonytestnet0':
      return ChainId.HarmonyTestnet0;
    case 'ganache':
      return ChainId.Ganache;
    case 'webb':
    case 'edgeware':
    case 'hedgeware':
    case 'rinkeby':
      return ChainId.Rinkeby;
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
  Rinkeby = 'rinkeby',
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
      break;
    case ChainId.Kovan:
      break;
    case ChainId.Goerli:
      break;
    case ChainId.HarmonyTestnet0:
      return RelayerChainName.HarmonyTestnet0;
    case ChainId.HarmonyTestnet1:
      return RelayerChainName.HarmonyTestnet1;
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
        return null;
      }
      return null;
    });
  }
  return builder;
}
