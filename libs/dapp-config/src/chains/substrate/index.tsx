import { PresetTypedChainId, SubstrateChainId } from '@webb-tools/dapp-types';
import KSMLogo from '@webb-tools/logos/chains/KusamaLogo';
import DOTLogo from '@webb-tools/logos/chains/PolkadotLogo';
import WEBBLogo from '@webb-tools/logos/chains/WebbLogo';
import { ChainType } from '@webb-tools/sdk-core';

import { ChainConfig } from '../chain-config.interface';

function populateBlockExplorerStub(connString: string): string {
  const params = new URLSearchParams({
    rpc: connString,
  });
  const url = new URL(
    `?${params.toString()}`,
    'https://polkadot.js.org/apps/'
  ).toString();
  return url + '#';
}

// All substrate chains temporary use in `development` environment now
export const chainsConfig: Record<number, ChainConfig> = {
  [PresetTypedChainId.ProtocolSubstrateStandalone]: {
    chainType: ChainType.Substrate,
    group: 'webb',
    tag: 'dev',
    chainId: SubstrateChainId.ProtocolSubstrateStandalone,
    logo: WEBBLogo,
    url: 'ws://127.0.0.1:9944',
    blockExplorerStub: populateBlockExplorerStub('ws://127.0.0.1:9944'),
    name: 'Substrate',
    env: ['development'],
  },
  [PresetTypedChainId.LocalTangleStandalone]: {
    chainType: ChainType.Substrate,
    group: 'webb',
    tag: 'dev',
    chainId: SubstrateChainId.LocalTangleStandalone,
    logo: WEBBLogo,
    url: 'ws://127.0.0.1:9944',
    blockExplorerStub: populateBlockExplorerStub('ws://127.0.0.1:9944'),
    name: 'Tangle',
    env: ['development'],
  },
  [PresetTypedChainId.Kusama]: {
    chainType: ChainType.KusamaRelayChain,
    group: 'webb',
    tag: 'live',
    chainId: SubstrateChainId.Kusama,
    logo: KSMLogo,
    url: 'wss://kusama-rpc.polkadot.io',
    blockExplorerStub: populateBlockExplorerStub(
      'wss://kusama-rpc.polkadot.io'
    ),
    name: 'Kusama',
    env: ['development'],
  },
  [PresetTypedChainId.Polkadot]: {
    chainType: ChainType.PolkadotRelayChain,
    group: 'webb',
    tag: 'live',
    chainId: SubstrateChainId.Polkadot,
    logo: DOTLogo,
    url: 'wss://rpc.polkadot.io',
    blockExplorerStub: populateBlockExplorerStub('wss://rpc.polkadot.io'),
    name: 'Polkadot',
    env: ['development'],
  },
};
