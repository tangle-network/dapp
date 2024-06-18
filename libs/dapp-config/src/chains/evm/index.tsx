// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { EVMChainId, PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';
import { ChainType } from '@webb-tools/sdk-core/typed-chain-id';
import {
  arbitrumGoerli,
  avalancheFuji,
  goerli,
  moonbaseAlpha,
  optimismGoerli,
  polygonMumbai,
  scrollSepolia,
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

export const chainsConfig: Record<number, ChainConfig> = {
  // Testnet
  [PresetTypedChainId.Goerli]: {
    ...goerli,
    chainType: ChainType.EVM,
    group: 'ethereum',
    tag: 'test',
  },
  [PresetTypedChainId.OptimismTestnet]: {
    ...optimismGoerli,
    chainType: ChainType.EVM,
    group: 'optimism',
    tag: 'test',
  },
  [PresetTypedChainId.ArbitrumTestnet]: {
    ...arbitrumGoerli,
    chainType: ChainType.EVM,
    group: 'arbitrum',
    tag: 'test',
  },
  [PresetTypedChainId.PolygonTestnet]: {
    ...polygonMumbai,
    chainType: ChainType.EVM,
    group: 'polygon',
    tag: 'test',
  },
  [PresetTypedChainId.MoonbaseAlpha]: {
    ...moonbaseAlpha,
    chainType: ChainType.EVM,
    group: 'moonbeam',
    tag: 'test',
  },
  [PresetTypedChainId.Sepolia]: {
    ...sepolia,
    chainType: ChainType.EVM,
    group: 'ethereum',
    tag: 'test',
  },
  [PresetTypedChainId.AvalancheFuji]: {
    ...avalancheFuji,
    chainType: ChainType.EVM,
    group: 'avalanche',
    tag: 'test',
  },
  [PresetTypedChainId.ScrollSepolia]: {
    ...scrollSepolia,
    chainType: ChainType.EVM,
    group: 'scroll',
    tag: 'test',
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
    ...(!process.env['USING_LOCAL_TANGLE']
      ? {
          blockExplorers: {
            default: {
              name: 'Tangle Testnet EVM Explorer',
              url: TANGLE_TESTNET_EVM_EXPLORER_URL,
            },
          },
        }
      : {}),
    rpcUrls: {
      default: {
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
        http: [`http://127.0.0.1:5004`],
      },
    },
    env: ['development'],
    ...(localOrbitMulticall3Address
      ? {
          contracts: {
            multicall3: {
              address: `0x${localOrbitMulticall3Address.replace(/^0x/, '')}`,
              blockCreated: localHermesMulticall3DeploymentBlock,
            },
          },
        }
      : {}),
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
        http: [`http://127.0.0.1:5005`],
      },
    },
    env: ['development'],
    ...(localOrbitMulticall3Address
      ? {
          contracts: {
            multicall3: {
              address: `0x${localOrbitMulticall3Address.replace(/^0x/, '')}`,
              blockCreated: localAthenaMulticall3DeploymentBlock,
            },
          },
        }
      : {}),
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
        http: [`http://127.0.0.1:5006`],
      },
    },
    env: ['development'],
    ...(localOrbitMulticall3Address
      ? {
          contracts: {
            multicall3: {
              address: `0x${localOrbitMulticall3Address.replace(/^0x/, '')}`,
              blockCreated: localDemeterMulticall3DeploymentBlock,
            },
          },
        }
      : {}),
  } satisfies ChainConfig,
};
