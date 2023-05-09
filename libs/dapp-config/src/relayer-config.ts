import { PresetTypedChainId } from '@webb-tools/dapp-types';
import { calculateTypedChainId, ChainType } from '@webb-tools/sdk-core';

import { AppEnvironment } from './types';

/**
 * Relayer configuration
 * it's now the endpoint and info/metada ..etc is fetched via http
 * @param endpoint - relayer http endpoint
 * @param env - the supported environments of this relayer (defaults to all)
 **/
export type RelayerConfig = {
  endpoint: string;
  env?: AppEnvironment[];
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
    endpoint: 'https://relayer1.webb.tools',
  },
  {
    endpoint: 'https://relayer2.webb.tools',
  },
  {
    endpoint: 'https://relayer3.webb.tools',
    env: ['development', 'staging', 'test'],
  },
  {
    endpoint: 'https://relayer4.webb.tools',
    env: ['development', 'staging', 'test'],
  },
];

export function relayerSubstrateNameToTypedChainId(
  name: string
): PresetTypedChainId {
  switch (name) {
    case 'localnode':
      return PresetTypedChainId.ProtocolSubstrateStandalone;
    case 'tangle':
      return PresetTypedChainId.LocalTangleStandalone;
  }

  throw new Error('unhandled relayed chain name  ' + name);
}

export function typedChainIdToSubstrateRelayerName(id: number): string {
  switch (id) {
    case PresetTypedChainId.ProtocolSubstrateStandalone:
      return 'localnode';
    case PresetTypedChainId.LocalTangleStandalone:
      return 'tangle';
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
