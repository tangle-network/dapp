import { PresetTypedChainId, SubstrateChainId } from '@webb-tools/dapp-types';
import { ChainType } from '@webb-tools/sdk-core/typed-chain-id';
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
    id: SubstrateChainId.ProtocolSubstrateStandalone,
    name: 'Substrate',
    network: 'Substrate',
    group: 'webb-dev',
    tag: 'dev',
    nativeCurrency: {
      name: 'Webb Substrate',
      symbol: 'WEBB',
      decimals: 18,
    },
    blockExplorers: {
      default: {
        name: 'Substrate Explorer',
        url: populateBlockExplorerStub('ws://127.0.0.1:9944'),
      },
    },
    rpcUrls: {
      default: {
        http: [],
        webSocket: ['ws://127.0.0.1:9944'],
      },
      public: {
        http: [],
        webSocket: ['ws://127.0.0.1:9944'],
      },
    },
    env: ['development'],
  },
  [PresetTypedChainId.LocalTangleStandalone]: {
    chainType: ChainType.Substrate,
    id: SubstrateChainId.LocalTangleStandalone,
    name: 'Tangle',
    network: 'Substrate',
    group: 'tangle',
    tag: 'dev',
    nativeCurrency: {
      name: 'Tangle',
      symbol: 'TNT',
      decimals: 18,
    },
    blockExplorers: {
      default: {
        name: 'Tangle Explorer',
        url: populateBlockExplorerStub('ws://127.0.0.1:9944'),
      },
    },
    rpcUrls: {
      default: {
        http: [],
        webSocket: ['ws://127.0.0.1:9944'],
      },
      public: {
        http: [],
        webSocket: ['ws://127.0.0.1:9944'],
      },
    },
    env: ['development'],
  },
  /*   [PresetTypedChainId.TangleStandaloneTestnet]: {
    chainType: ChainType.Substrate,
    group: 'webb',
    tag: 'test',
    chainId: SubstrateChainId.TangleStandaloneTestnet,
    logo: WEBBLogo,
    url: 'wss://tangle-standalone-archive.webb.tools',
    blockExplorerStub: populateBlockExplorerStub(
      'wss://tangle-standalone-archive.webb.tools'
    ),
    name: 'Tangle Standalone Testnet',
    env: ['development'],
  }, */
  [PresetTypedChainId.Kusama]: {
    chainType: ChainType.KusamaRelayChain,
    id: SubstrateChainId.Kusama,
    name: 'Kusama',
    network: 'Kusama',
    group: 'kusama',
    tag: 'live',
    nativeCurrency: {
      name: 'Kusama',
      symbol: 'KSM',
      decimals: 12,
    },
    blockExplorers: {
      default: {
        name: 'Kusama Explorer',
        url: populateBlockExplorerStub('wss://kusama-rpc.polkadot.io'),
      },
    },
    rpcUrls: {
      default: {
        http: [],
        webSocket: ['wss://kusama-rpc.polkadot.io'],
      },
      public: {
        http: [],
        webSocket: ['wss://kusama-rpc.polkadot.io'],
      },
    },
    env: ['development'],
  },
  [PresetTypedChainId.Polkadot]: {
    chainType: ChainType.PolkadotRelayChain,
    id: SubstrateChainId.Polkadot,
    name: 'Polkadot',
    network: 'Polkadot',
    group: 'polkadot',
    tag: 'live',
    nativeCurrency: {
      name: 'Polkadot',
      symbol: 'DOT',
      decimals: 10,
    },
    blockExplorers: {
      default: {
        name: 'Kusama Explorer',
        url: populateBlockExplorerStub('wss://rpc.polkadot.io'),
      },
    },
    rpcUrls: {
      default: {
        http: [],
        webSocket: ['wss://rpc.polkadot.io'],
      },
      public: {
        http: [],
        webSocket: ['wss://rpc.polkadot.io'],
      },
    },
    env: ['development'],
  },
};
