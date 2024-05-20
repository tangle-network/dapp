// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { EVMChainId, PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';
import { ChainType } from '@webb-tools/sdk-core/typed-chain-id';
import {
  type Chain,
  arbitrumGoerli,
  avalancheFuji,
  goerli,
  moonbaseAlpha,
  optimismGoerli,
  polygonMumbai,
  scrollTestnet,
  sepolia,
} from 'viem/chains';
import {
  TANGLE_LOCAL_HTTP_RPC_ENDPOINT,
  TANGLE_MAINNET_EVM_EXPLORER_URL,
  TANGLE_MAINNET_HTTP_RPC_ENDPOINT,
  TANGLE_TESTNET_EVM_EXPLORER_URL,
  TANGLE_TESTNET_HTTP_RPC_ENDPOINT,
} from '../../constants/tangle';
import { DEFAULT_EVM_CURRENCY } from '../../currencies';
import type { ChainConfig } from '../chain-config.interface';

const localOrbitMulticall3Address =
  process.env.BRIDGE_DAPP_LOCAL_ORBIT_MULTICALL3_ADDRESS;

const localAthenaMulticall3DeploymentBlock = process.env
  .BRIDGE_DAPP_LOCAL_ATHENA_MULTICALL3_DEPLOYMENT_BLOCK
  ? parseInt(process.env.BRIDGE_DAPP_LOCAL_ATHENA_MULTICALL3_DEPLOYMENT_BLOCK)
  : 0;

const localHermesMulticall3DeploymentBlock = process.env
  .BRIDGE_DAPP_LOCAL_HERMES_MULTICALL3_DEPLOYMENT_BLOCK
  ? parseInt(process.env.BRIDGE_DAPP_LOCAL_HERMES_MULTICALL3_DEPLOYMENT_BLOCK)
  : 0;

const localDemeterMulticall3DeploymentBlock = process.env
  .BRIDGE_DAPP_LOCAL_DEMETER_MULTICALL3_DEPLOYMENT_BLOCK
  ? parseInt(process.env.BRIDGE_DAPP_LOCAL_DEMETER_MULTICALL3_DEPLOYMENT_BLOCK)
  : 0;

function ensurePublicRpc(chain: Chain): Chain {
  return {
    ...chain,
    rpcUrls: {
      ...chain.rpcUrls,
      public: {
        ...chain.rpcUrls.default,
      },
    },
  };
}

export const chainsConfig: Record<number, ChainConfig> = {
  // Testnet
  [PresetTypedChainId.Goerli]: {
    ...ensurePublicRpc(goerli),
    chainType: ChainType.EVM,
    group: 'ethereum',
    tag: 'test',
  },
  [PresetTypedChainId.OptimismTestnet]: {
    ...ensurePublicRpc(optimismGoerli),
    chainType: ChainType.EVM,
    group: 'optimism',
    tag: 'test',
  },
  [PresetTypedChainId.ArbitrumTestnet]: {
    ...ensurePublicRpc(arbitrumGoerli),
    chainType: ChainType.EVM,
    group: 'arbitrum',
    tag: 'test',
  },
  [PresetTypedChainId.PolygonTestnet]: {
    ...ensurePublicRpc(polygonMumbai),
    chainType: ChainType.EVM,
    group: 'polygon',
    tag: 'test',
  },
  [PresetTypedChainId.MoonbaseAlpha]: {
    ...ensurePublicRpc(moonbaseAlpha),
    chainType: ChainType.EVM,
    group: 'moonbeam',
    tag: 'test',
  },
  [PresetTypedChainId.Sepolia]: {
    ...ensurePublicRpc(sepolia),
    chainType: ChainType.EVM,
    group: 'ethereum',
    tag: 'test',
  },
  [PresetTypedChainId.AvalancheFuji]: {
    ...ensurePublicRpc(avalancheFuji),
    chainType: ChainType.EVM,
    group: 'avalanche',
    tag: 'test',
  },
  [PresetTypedChainId.ScrollAlpha]: {
    ...ensurePublicRpc(scrollTestnet),
    chainType: ChainType.EVM,
    group: 'scroll',
    tag: 'test',
    contracts: {
      multicall3: {
        address: '0xcA11bde05977b3631167028862bE2a173976CA11',
        blockCreated: 2745641,
      },
    },
  },

  [PresetTypedChainId.TangleMainnetEVM]: {
    chainType: ChainType.EVM,
    id: EVMChainId.TangleMainnetEVM,
    name: 'Tangle Mainnet EVM',
    group: 'tangle',
    tag: 'live',
    nativeCurrency: {
      name: 'Tangle Network Token',
      symbol: 'TNT',
      decimals: 18,
    },
    blockExplorers: {
      default: {
        name: 'Tangle Mainnet EVM Explorer',
        url: TANGLE_MAINNET_EVM_EXPLORER_URL,
      },
    },
    rpcUrls: {
      default: {
        http: [TANGLE_MAINNET_HTTP_RPC_ENDPOINT],
      },
      public: {
        http: [TANGLE_MAINNET_HTTP_RPC_ENDPOINT],
      },
    },
  } satisfies ChainConfig,

  [PresetTypedChainId.TangleTestnetEVM]: {
    chainType: ChainType.EVM,
    id: EVMChainId.TangleTestnetEVM,
    name: 'Tangle Testnet EVM',
    group: 'tangle',
    tag: 'test',
    nativeCurrency: {
      name: 'Test Tangle Network Token',
      symbol: 'tTNT',
      decimals: 18,
    },
    blockExplorers: !process.env['USING_LOCAL_TANGLE']
      ? {
          default: {
            name: 'Tangle Testnet EVM Explorer',
            url: TANGLE_TESTNET_EVM_EXPLORER_URL,
          },
        }
      : undefined,
    rpcUrls: {
      default: {
        http: process.env['USING_LOCAL_TANGLE']
          ? [TANGLE_LOCAL_HTTP_RPC_ENDPOINT]
          : [TANGLE_TESTNET_HTTP_RPC_ENDPOINT],
      },
      public: {
        http: process.env['USING_LOCAL_TANGLE']
          ? [TANGLE_LOCAL_HTTP_RPC_ENDPOINT]
          : [TANGLE_TESTNET_HTTP_RPC_ENDPOINT],
      },
    },
  } satisfies ChainConfig,

  // Localnet
  [PresetTypedChainId.HermesLocalnet]: {
    chainType: ChainType.EVM,
    id: EVMChainId.HermesLocalnet,
    name: 'Hermes',
    group: 'webb-dev',
    tag: 'dev',
    nativeCurrency: DEFAULT_EVM_CURRENCY,
    rpcUrls: {
      default: {
        http: [`http://127.0.0.1:${EVMChainId.HermesLocalnet}`],
      },
      public: {
        http: [`http://127.0.0.1:${EVMChainId.HermesLocalnet}`],
      },
    },
    env: ['development'],
    contracts: localOrbitMulticall3Address
      ? {
          multicall3: {
            address: `0x${localOrbitMulticall3Address.replace(/^0x/, '')}`,
            blockCreated: localHermesMulticall3DeploymentBlock,
          },
        }
      : undefined,
  } satisfies ChainConfig,

  [PresetTypedChainId.AthenaLocalnet]: {
    chainType: ChainType.EVM,
    id: EVMChainId.AthenaLocalnet,
    name: 'Athena',
    group: 'webb-dev',
    tag: 'dev',
    nativeCurrency: DEFAULT_EVM_CURRENCY,
    rpcUrls: {
      default: {
        http: [`http://127.0.0.1:${EVMChainId.AthenaLocalnet}`],
      },
      public: {
        http: [`http://127.0.0.1:${EVMChainId.AthenaLocalnet}`],
      },
    },
    env: ['development'],
    contracts: localOrbitMulticall3Address
      ? {
          multicall3: {
            address: `0x${localOrbitMulticall3Address.replace(/^0x/, '')}`,
            blockCreated: localAthenaMulticall3DeploymentBlock,
          },
        }
      : undefined,
  } satisfies ChainConfig,

  [PresetTypedChainId.DemeterLocalnet]: {
    chainType: ChainType.EVM,
    id: EVMChainId.DemeterLocalnet,
    name: 'Demeter',
    group: 'webb-dev',
    tag: 'dev',
    nativeCurrency: DEFAULT_EVM_CURRENCY,
    rpcUrls: {
      default: {
        http: [`http://127.0.0.1:${EVMChainId.DemeterLocalnet}`],
      },
      public: {
        http: [`http://127.0.0.1:${EVMChainId.DemeterLocalnet}`],
      },
    },
    env: ['development'],
    contracts: localOrbitMulticall3Address
      ? {
          multicall3: {
            address: `0x${localOrbitMulticall3Address.replace(/^0x/, '')}`,
            blockCreated: localDemeterMulticall3DeploymentBlock,
          },
        }
      : undefined,
  } satisfies ChainConfig,
};
