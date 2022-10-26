import { PresetTypedChainId } from '@nepoche/dapp-types';
import { calculateTypedChainId, ChainType } from '@webb-tools/sdk-core';

/**
 * Relayer configuration
 * it's now the endpoint and info/metada ..etc is fetched via http
 * @param endpoint - relayer http endpoint
 **/
export type RelayerConfig = {
  endpoint: string;
};

/**
 * Relayer command key
 * it can be evm, or substrate  it's used to format the Web Socket for the relayer
 *
 **/
export type RelayerCMDBase = 'evm' | 'substrate';

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

export function relayerSubstrateNameToTypedChainId(name: string): PresetTypedChainId {
  switch (name) {
    case 'localnode':
      return PresetTypedChainId.ProtocolSubstrateStandalone;
    case 'webbeggnet':
      return PresetTypedChainId.LocalTangleStandalone;
  }

  throw new Error('unhandled relayed chain name  ' + name);
}

export function typedChainIdToSubstrateRelayerName(id: number): string {
  switch (id) {
    case PresetTypedChainId.ProtocolSubstrateStandalone:
      return 'localnode';
    case PresetTypedChainId.LocalTangleStandalone:
      return 'webbeggnet';
  }

  throw new Error('unhandled chain id for substrate');
}

export function chainNameAdapter(name: string, basedOn: RelayerCMDBase) {
  try {
    return basedOn === 'evm'
      ? calculateTypedChainId(ChainType.EVM, Number(name))
      : relayerSubstrateNameToTypedChainId(name);
  } catch (e) {
    return null;
  }
}
