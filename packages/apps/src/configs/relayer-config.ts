import { RelayerConfig, WebbRelayerBuilder } from '@webb-dapp/react-environment/webb-context/relayer';
import { ChainId } from '@webb-dapp/apps/configs/chains';

let builder: WebbRelayerBuilder | null = null;
export const relayerConfig: RelayerConfig[] = [
  {
    address: 'http://localhost:9955',
  },
  {
    address: 'http://nepoche.com:9955',
  },
];

export function relayerNameToChainId(name: string): ChainId {
  switch (name) {
    case 'beresheet':
      return ChainId.EdgewareTestNet;
    case 'harmony':
      return ChainId.HarmonyTest1;
  }
  throw new Error('unhandled relayed chain name');
}

export function chainIdToRelayerName(id: ChainId): string {
  switch (id) {
    case ChainId.Edgeware:
      return 'edgware';
    case ChainId.EdgewareTestNet:
      return 'beresheet';
    case ChainId.EdgewareLocalNet:
      break;
    case ChainId.EthereumMainNet:
      break;
    case ChainId.Rinkeby:
      break;
    case ChainId.Ropsten:
      break;
    case ChainId.Kovan:
      break;
    case ChainId.Goerli:
      break;
    case ChainId.HarmonyTestnet1:
      break;
    case ChainId.HarmonyTest0:
      break;
    case ChainId.HarmonyTest1:
      return 'harmony';
  }
  throw new Error('unhandled relayed chain name');
}

export async function getWebbRelayer() {
  if (!builder) {
    builder = await WebbRelayerBuilder.initBuilder(relayerConfig, (name, basedOn) => {
      if (basedOn === 'evm') {
        return relayerNameToChainId(name);
      }
      if (basedOn === 'substrate') {
        return null;
      }
      return null;
    });
  }
  return builder;
}
