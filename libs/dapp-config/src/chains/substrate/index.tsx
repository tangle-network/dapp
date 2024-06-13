import { PresetTypedChainId, SubstrateChainId } from '@webb-tools/dapp-types';
import { ChainType } from '@webb-tools/sdk-core/typed-chain-id';
import {
  TANGLE_MAINNET_WS_RPC_ENDPOINT,
  TANGLE_MAINNET_NATIVE_EXPLORER_URL,
  TANGLE_MAINNET_NATIVE_TOKEN_SYMBOL,
  TANGLE_TESTNET_WS_RPC_ENDPOINT,
  TANGLE_TESTNET_NATIVE_EXPLORER_URL,
  TANGLE_LOCAL_WS_RPC_ENDPOINT,
  TANGLE_TESTNET_NATIVE_TOKEN_SYMBOL,
  TANGLE_TOKEN_DECIMALS,
} from '../../constants/tangle';
import { ChainConfig } from '../chain-config.interface';

// All substrate chains temporary use in `development` environment now
export const chainsConfig: Record<number, ChainConfig> = {
  [PresetTypedChainId.TangleMainnetNative]: {
    chainType: ChainType.Substrate,
    group: 'tangle',
    tag: 'live',
    id: SubstrateChainId.TangleMainnetNative,
    name: 'Tangle Mainnet Native',
    nativeCurrency: {
      name: 'Tangle Mainnet Token',
      symbol: TANGLE_MAINNET_NATIVE_TOKEN_SYMBOL,
      decimals: TANGLE_TOKEN_DECIMALS,
    },
    blockExplorers: {
      default: {
        name: 'Tangle Explorer',
        url: TANGLE_MAINNET_NATIVE_EXPLORER_URL,
      },
    },
    rpcUrls: {
      default: {
        http: [],
        webSocket: [TANGLE_MAINNET_WS_RPC_ENDPOINT],
      },
      public: {
        http: [],
        webSocket: [TANGLE_MAINNET_WS_RPC_ENDPOINT],
      },
    },
  },

  [PresetTypedChainId.TangleTestnetNative]: {
    chainType: ChainType.Substrate,
    group: 'tangle',
    tag: process.env['USING_LOCAL_TANGLE'] ? 'dev' : 'test',
    id: SubstrateChainId.TangleTestnetNative,
    name: 'Tangle Testnet Native',
    nativeCurrency: {
      name: 'Tangle',
      symbol: TANGLE_TESTNET_NATIVE_TOKEN_SYMBOL,
      decimals: TANGLE_TOKEN_DECIMALS,
    },
    blockExplorers: {
      default: {
        name: 'Tangle Explorer',
        url: process.env['USING_LOCAL_TANGLE']
          ? 'https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:9944#/explorer/'
          : TANGLE_TESTNET_NATIVE_EXPLORER_URL,
      },
    },
    rpcUrls: {
      default: {
        http: [],
        webSocket: process.env['USING_LOCAL_TANGLE']
          ? [TANGLE_LOCAL_WS_RPC_ENDPOINT]
          : [TANGLE_TESTNET_WS_RPC_ENDPOINT],
      },
      public: {
        http: [],
        webSocket: process.env['USING_LOCAL_TANGLE']
          ? [TANGLE_LOCAL_WS_RPC_ENDPOINT]
          : [TANGLE_TESTNET_WS_RPC_ENDPOINT],
      },
    },
    env: ['development'],
  },

  [PresetTypedChainId.Kusama]: {
    chainType: ChainType.KusamaRelayChain,
    id: SubstrateChainId.Kusama,
    name: 'Kusama',
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
        url: 'https://kusama.statescan.io/',
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
    group: 'polkadot',
    tag: 'live',
    nativeCurrency: {
      name: 'Polkadot',
      symbol: 'DOT',
      decimals: 10,
    },
    blockExplorers: {
      default: {
        name: 'Polkadot Explorer',
        url: 'https://polkadot.statescan.io/',
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

  [PresetTypedChainId.RococoPhala]: {
    chainType: ChainType.Substrate,
    id: SubstrateChainId.RococoPhala,
    name: 'Rococo Phala',
    group: 'phala',
    tag: 'test',
    nativeCurrency: {
      name: 'Phala',
      symbol: 'PHA',
      decimals: 6,
    },
    blockExplorers: {
      default: {
        name: 'Phala Explorer',
        url: 'https://polkadot.js.org/apps/?rpc=wss://rococo.phala.network#/explorer/',
      },
    },
    rpcUrls: {
      default: {
        http: [],
        webSocket: ['wss://rhala-node.phala.network/ws'],
      },
      public: {
        http: [],
        webSocket: ['wss://rhala-node.phala.network/ws'],
      },
    },
    env: ['development'],
  },
};
