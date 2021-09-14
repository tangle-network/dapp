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
    case 'harmony':
      return ChainId.HarmonyTestnet1;
    case 'ganache':
      return ChainId.Ganache;
    case 'webb':
    case 'edgeware':
    case 'hedgeware':
    case 'rinkeby':
      return ChainId.Rinkeby;
  }

  console.log('unhandled relayed chain name  ' + name);
  throw new Error('unhandled relayed chain name  ' + name);
}

enum RelayerChainName {
  Edgeware = 'edgeware',
  Webb = 'webb',
  Ganache = 'ganache',
  Beresheet = 'beresheet',
  Harmony = 'harmony',
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
    case ChainId.HarmonyTestnet1:
      return RelayerChainName.Harmony;
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
