import {
  AppConfig,
  evmIdIntoInternalChainId,
  InternalChainId,
  RelayerConfig,
  substrateIdIntoInternalChainId,
  WebbRelayerManagerFactory,
} from '@webb-dapp/api-providers';

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

export function internalIdToSubstrateRelayerName(id: InternalChainId): string {
  switch (id) {
    case InternalChainId.ProtocolSubstrateStandalone:
      return 'localnode';
    case InternalChainId.EggStandalone:
      return 'webbeggnet';
  }

  throw new Error('unhandled chain id for substrate');
}

export async function getRelayerManagerFactory(appConfig: AppConfig) {
  if (!relayerManagerFactory) {
    relayerManagerFactory = await WebbRelayerManagerFactory.init(
      relayerConfig,
      (name, basedOn) => {
        try {
          return basedOn === 'evm' ? evmIdIntoInternalChainId(name) : substrateIdIntoInternalChainId(Number(name));
        } catch (e) {
          return null;
        }
      },
      appConfig
    );
  }
  return relayerManagerFactory;
}
