// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import {
  arbitrumGoerli,
  avalancheFuji,
  goerli,
  moonbaseAlpha,
  optimismGoerli,
  polygonMumbai,
  scrollTestnet,
  sepolia,
  type Chain,
} from '@wagmi/chains';
import { EVMChainId, PresetTypedChainId } from '@webb-tools/dapp-types';
import { ChainType } from '@webb-tools/sdk-core/typed-chain-id';
import merge from 'lodash/merge';
import { DEFAULT_EVM_CURRENCY } from '../../currencies';
import { ChainConfig, WebbExtendedChain } from '../chain-config.interface';

const hostedOrbitMulticall3Address =
  process.env.BRIDGE_DAPP_HOSTED_ORBIT_MULTLICALL3_ADDRESS;

const athenaOrbitMulticall3DeploymentBlock = process.env
  .BRIDGE_DAPP_ATHENA_ORBIT_MULTICALL3_DEPLOYMENT_BLOCK
  ? parseInt(process.env.BRIDGE_DAPP_ATHENA_ORBIT_MULTICALL3_DEPLOYMENT_BLOCK)
  : 0;

const hermesOrbitMulticall3DeploymentBlock = process.env
  .BRIDGE_DAPP_HERMES_ORBIT_MULTICALL3_DEPLOYMENT_BLOCK
  ? parseInt(process.env.BRIDGE_DAPP_HERMES_ORBIT_MULTICALL3_DEPLOYMENT_BLOCK)
  : 0;

const demeterOrbitMulticall3DeploymentBlock = process.env
  .BRIDGE_DAPP_DEMETER_ORBIT_MULTICALL3_DEPLOYMENT_BLOCK
  ? parseInt(process.env.BRIDGE_DAPP_DEMETER_ORBIT_MULTICALL3_DEPLOYMENT_BLOCK)
  : 0;

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
  [PresetTypedChainId.Goerli]: merge<Chain, WebbExtendedChain>(goerli, {
    chainType: ChainType.EVM,
    group: 'ethereum',
    tag: 'test',
  }),
  [PresetTypedChainId.OptimismTestnet]: merge<Chain, WebbExtendedChain>(
    optimismGoerli,
    {
      chainType: ChainType.EVM,
      group: 'optimism',
      tag: 'test',
    }
  ),
  [PresetTypedChainId.ArbitrumTestnet]: merge<Chain, WebbExtendedChain>(
    arbitrumGoerli,
    {
      chainType: ChainType.EVM,
      group: 'arbitrum',
      tag: 'test',
    }
  ),
  [PresetTypedChainId.PolygonTestnet]: merge<Chain, WebbExtendedChain>(
    polygonMumbai,
    {
      chainType: ChainType.EVM,
      group: 'polygon',
      tag: 'test',
    }
  ),
  [PresetTypedChainId.MoonbaseAlpha]: merge<Chain, WebbExtendedChain>(
    moonbaseAlpha,
    {
      chainType: ChainType.EVM,
      group: 'moonbeam',
      tag: 'test',
    }
  ),
  [PresetTypedChainId.Sepolia]: merge<Chain, WebbExtendedChain>(sepolia, {
    chainType: ChainType.EVM,
    group: 'ethereum',
    tag: 'test',
  }),
  [PresetTypedChainId.AvalancheFuji]: merge<Chain, WebbExtendedChain>(
    avalancheFuji,
    {
      chainType: ChainType.EVM,
      group: 'avalanche',
      tag: 'test',
    }
  ),
  [PresetTypedChainId.ScrollAlpha]: merge<Chain, WebbExtendedChain>(
    scrollTestnet,
    {
      chainType: ChainType.EVM,
      group: 'scroll',
      tag: 'test',
      contracts: {
        multicall3: {
          address: '0xcA11bde05977b3631167028862bE2a173976CA11',
          blockCreated: 2745641,
        },
      },
    }
  ),

  // Self hosted chains
  [PresetTypedChainId.HermesOrbit]: {
    chainType: ChainType.EVM,
    id: EVMChainId.HermesOrbit,
    name: 'Hermes Orbit',
    network: 'Orbit',
    group: 'orbit',
    tag: 'test',
    nativeCurrency: DEFAULT_EVM_CURRENCY,
    blockExplorers: {
      default: {
        name: 'Hermes Orbit Explorer',
        url: 'https://hermes-explorer.webb.tools',
      },
    },
    rpcUrls: {
      default: {
        http: ['https://hermes-testnet.webb.tools'],
      },
      public: {
        http: ['https://hermes-testnet.webb.tools'],
      },
    },
    env: ['development', 'test'],
    contracts: {
      multicall3: hostedOrbitMulticall3Address
        ? {
            address: `0x${hostedOrbitMulticall3Address.replace(/^0x/, '')}`,
            blockCreated: hermesOrbitMulticall3DeploymentBlock,
          }
        : undefined,
    },
  },

  [PresetTypedChainId.AthenaOrbit]: {
    chainType: ChainType.EVM,
    id: EVMChainId.AthenaOrbit,
    name: 'Athena Orbit',
    network: 'Orbit',
    group: 'orbit',
    tag: 'test',
    nativeCurrency: DEFAULT_EVM_CURRENCY,
    blockExplorers: {
      default: {
        name: 'Athena Orbit Explorer',
        url: 'https://athena-explorer.webb.tools',
      },
    },
    rpcUrls: {
      default: {
        http: ['https://athena-testnet.webb.tools'],
      },
      public: {
        http: ['https://athena-testnet.webb.tools'],
      },
    },
    env: ['development', 'test'],
    contracts: {
      multicall3: hostedOrbitMulticall3Address
        ? {
            address: `0x${hostedOrbitMulticall3Address.replace(/^0x/, '')}`,
            blockCreated: athenaOrbitMulticall3DeploymentBlock,
          }
        : undefined,
    },
  },

  [PresetTypedChainId.DemeterOrbit]: {
    chainType: ChainType.EVM,
    id: EVMChainId.DemeterOrbit,
    name: 'Demeter Orbit',
    network: 'Orbit',
    group: 'orbit',
    tag: 'test',
    nativeCurrency: DEFAULT_EVM_CURRENCY,
    blockExplorers: {
      default: {
        name: 'Demeter Orbit Explorer',
        url: 'https://demeter-explorer.webb.tools',
      },
    },
    rpcUrls: {
      default: {
        http: ['https://demeter-testnet.webb.tools'],
      },
      public: {
        http: ['https://demeter-testnet.webb.tools'],
      },
    },
    env: ['development', 'test'],
    contracts: {
      multicall3: hostedOrbitMulticall3Address
        ? {
            address: `0x${hostedOrbitMulticall3Address.replace(/^0x/, '')}`,
            blockCreated: demeterOrbitMulticall3DeploymentBlock,
          }
        : undefined,
    },
  },

  // Localnet
  [PresetTypedChainId.HermesLocalnet]: {
    chainType: ChainType.EVM,
    id: EVMChainId.HermesLocalnet,
    name: 'Hermes',
    network: 'Orbit',
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
    contracts: {
      multicall3: localOrbitMulticall3Address
        ? {
            address: `0x${localOrbitMulticall3Address.replace(/^0x/, '')}`,
            blockCreated: localHermesMulticall3DeploymentBlock,
          }
        : undefined,
    },
  },

  [PresetTypedChainId.AthenaLocalnet]: {
    chainType: ChainType.EVM,
    id: EVMChainId.AthenaLocalnet,
    name: 'Athena',
    network: 'Orbit',
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
    contracts: {
      multicall3: localOrbitMulticall3Address
        ? {
            address: `0x${localOrbitMulticall3Address.replace(/^0x/, '')}`,
            blockCreated: localAthenaMulticall3DeploymentBlock,
          }
        : undefined,
    },
  },

  [PresetTypedChainId.DemeterLocalnet]: {
    chainType: ChainType.EVM,
    id: EVMChainId.DemeterLocalnet,
    name: 'Demeter',
    network: 'Orbit',
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
    contracts: {
      multicall3: localOrbitMulticall3Address
        ? {
            address: `0x${localOrbitMulticall3Address.replace(/^0x/, '')}`,
            blockCreated: localDemeterMulticall3DeploymentBlock,
          }
        : undefined,
    },
  },
};
