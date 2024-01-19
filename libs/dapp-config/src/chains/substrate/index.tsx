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
  return url;
}

// All substrate chains temporary use in `development` environment now
export const chainsConfig: Record<number, ChainConfig> = {
  [PresetTypedChainId.TangleStandaloneTestnet]: {
    chainType: ChainType.Substrate,
    group: 'tangle',
    tag: process.env['USING_LOCAL_TANGLE'] ? 'dev' : 'test',
    id: SubstrateChainId.TangleStandaloneTestnet,
    name: 'Tangle Standalone Testnet',
    network: 'Substrate',
    nativeCurrency: {
      name: 'Tangle',
      symbol: 'tTNT',
      decimals: 18,
    },
    blockExplorers: {
      default: {
        name: 'Tangle Explorer',
        url: process.env['USING_LOCAL_TANGLE']
          ? populateBlockExplorerStub('ws://127.0.0.1:9944')
          : populateBlockExplorerStub('wss://testnet-rpc.tangle.tools'),
      },
    },
    rpcUrls: {
      default: {
        http: [],
        webSocket: process.env['USING_LOCAL_TANGLE']
          ? ['ws://127.0.0.1:9944']
          : ['wss://testnet-rpc.tangle.tools'],
      },
      public: {
        http: [],
        webSocket: process.env['USING_LOCAL_TANGLE']
          ? ['ws://127.0.0.1:9944']
          : ['wss://testnet-rpc.tangle.tools'],
      },
    },
    env: ['development'],
  },
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
