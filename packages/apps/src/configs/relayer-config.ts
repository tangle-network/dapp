import {
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

// TODO: Read previously saved endpoints from localStorage, and pass with relayerConfig
export async function getRelayerManagerFactory() {
  if (!relayerManagerFactory) {
    relayerManagerFactory = await WebbRelayerManagerFactory.init(relayerConfig, (name, basedOn) => {
      try {
        return basedOn === 'evm' ? evmIdIntoInternalChainId(name) : substrateIdIntoInternalChainId(Number(name));
      } catch (e) {
        return null;
      }
    });
  }
  return relayerManagerFactory;
}
