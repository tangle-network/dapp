import {
  AppConfig,
  RelayerCMDBase,
  RelayerConfig,
  WebbRelayerManagerFactory,
  WebbTypedChainId,
} from '@webb-dapp/api-providers';
import { calculateTypedChainId, ChainType } from '@webb-tools/sdk-core';

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

export function relayerSubstrateNameToTypedChainId(name: string): WebbTypedChainId {
  switch (name) {
    case 'localnode':
      return WebbTypedChainId.ProtocolSubstrateStandalone;
    case 'webbeggnet':
      return WebbTypedChainId.EggStandalone;
  }

  throw new Error('unhandled relayed chain name  ' + name);
}

export function typedChainIdToSubstrateRelayerName(id: number): string {
  switch (id) {
    case WebbTypedChainId.ProtocolSubstrateStandalone:
      return 'localnode';
    case WebbTypedChainId.EggStandalone:
      return 'webbeggnet';
  }

  throw new Error('unhandled chain id for substrate');
}

function chainNameAdapter(name: string, basedOn: RelayerCMDBase) {
  try {
    return basedOn === 'evm'
      ? calculateTypedChainId(ChainType.EVM, Number(name))
      : relayerSubstrateNameToTypedChainId(name);
  } catch (e) {
    return null;
  }
}

export async function getRelayerManagerFactory(appConfig: AppConfig) {
  if (!relayerManagerFactory) {
    relayerManagerFactory = await WebbRelayerManagerFactory.init(relayerConfig, chainNameAdapter, appConfig);
  }
  return relayerManagerFactory;
}
