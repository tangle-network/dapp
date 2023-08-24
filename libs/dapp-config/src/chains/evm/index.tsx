// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import {
  arbitrumGoerli,
  avalancheFuji,
  goerli,
  moonbaseAlpha,
  optimismGoerli,
  polygonMumbai as polygonMumbai_,
  scrollTestnet,
  sepolia,
  type Chain,
} from '@wagmi/chains';
import { EVMChainId, PresetTypedChainId } from '@webb-tools/dapp-types';
import { ChainType } from '@webb-tools/sdk-core/typed-chain-id';
import merge from 'lodash/merge';
import mergeWith from 'lodash/mergeWith';
import cloneDeep from 'lodash/cloneDeep';
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

// Default rpc url of mumbai is not working so we override it
// endpoint here: https://chainid.network/chains.json
const polygonMumbai = merge(cloneDeep(polygonMumbai_), {
  rpcUrls: {
    default: {
      http: ['https://endpoints.omniatech.io/v1/matic/mumbai/public'],
    },
    public: {
      http: ['https://endpoints.omniatech.io/v1/matic/mumbai/public'],
    },
  },
});

const mergeChain = (
  chain: Chain,
  extended: WebbExtendedChain & { rpcUrls: Chain['rpcUrls'] }
): ChainConfig => {
  return mergeWith(cloneDeep(chain), extended, (objValue, srcValue) => {
    if (Array.isArray(objValue)) {
      return objValue.concat(srcValue);
    }

    return undefined;
  });
};

const additionalRpcUrls = {
  [PresetTypedChainId.Goerli]: [
    'https://ethereum-goerli.publicnode.com',
    'https://rpc.ankr.com/eth_goerli',
  ],
  [PresetTypedChainId.OptimismTestnet]: [
    'https://endpoints.omniatech.io/v1/op/goerli/public',
    'https://optimism-goerli.public.blastapi.io',
  ],
  [PresetTypedChainId.ArbitrumTestnet]: [
    'https://endpoints.omniatech.io/v1/arbitrum/goerli/public',
    'https://arbitrum-goerli.publicnode.com',
  ],
  [PresetTypedChainId.PolygonTestnet]: [
    'https://polygon-mumbai.blockpi.network/v1/rpc/public',
    'https://polygon-mumbai-bor.publicnode.com/',
  ],
  [PresetTypedChainId.MoonbaseAlpha]: [
    'https://moonbase-alpha.public.blastapi.io',
    'https://moonbeam-alpha.api.onfinality.io/public',
    'https://moonbase.unitedbloc.com:1000',
  ],
  [PresetTypedChainId.Sepolia]: [
    'https://endpoints.omniatech.io/v1/eth/sepolia/public',
    'https://eth-sepolia.public.blastapi.io',
  ],
  [PresetTypedChainId.AvalancheFuji]: [
    'https://avalanche-fuji-c-chain.publicnode.com',
    'https://api.avax-test.network/ext/bc/C/rpc',
  ],
  [PresetTypedChainId.ScrollAlpha]: [
    'https://scroll-testnet.blockpi.network/v1/rpc/public',
    'https://scroll-alphanet.public.blastapi.io',
  ],
};

export const chainsConfig: Record<number, ChainConfig> = {
  // Testnet
  [PresetTypedChainId.Goerli]: mergeChain(goerli, {
    chainType: ChainType.EVM,
    group: 'ethereum',
    tag: 'test',
    rpcUrls: {
      public: { http: additionalRpcUrls[PresetTypedChainId.Goerli] },
      default: { http: additionalRpcUrls[PresetTypedChainId.Goerli] },
    },
  }),
  [PresetTypedChainId.OptimismTestnet]: mergeChain(optimismGoerli, {
    chainType: ChainType.EVM,
    group: 'optimism',
    tag: 'test',
    rpcUrls: {
      public: { http: additionalRpcUrls[PresetTypedChainId.OptimismTestnet] },
      default: { http: additionalRpcUrls[PresetTypedChainId.OptimismTestnet] },
    },
  }),
  [PresetTypedChainId.ArbitrumTestnet]: mergeChain(arbitrumGoerli, {
    chainType: ChainType.EVM,
    group: 'arbitrum',
    tag: 'test',
    rpcUrls: {
      public: { http: additionalRpcUrls[PresetTypedChainId.ArbitrumTestnet] },
      default: { http: additionalRpcUrls[PresetTypedChainId.ArbitrumTestnet] },
    },
  }),
  [PresetTypedChainId.PolygonTestnet]: mergeChain(polygonMumbai, {
    chainType: ChainType.EVM,
    group: 'polygon',
    tag: 'test',
    rpcUrls: {
      public: { http: additionalRpcUrls[PresetTypedChainId.PolygonTestnet] },
      default: { http: additionalRpcUrls[PresetTypedChainId.PolygonTestnet] },
    },
  }),
  [PresetTypedChainId.MoonbaseAlpha]: mergeChain(moonbaseAlpha, {
    chainType: ChainType.EVM,
    group: 'moonbeam',
    tag: 'test',
    rpcUrls: {
      public: { http: additionalRpcUrls[PresetTypedChainId.MoonbaseAlpha] },
      default: { http: additionalRpcUrls[PresetTypedChainId.MoonbaseAlpha] },
    },
  }),
  [PresetTypedChainId.Sepolia]: mergeChain(sepolia, {
    chainType: ChainType.EVM,
    group: 'ethereum',
    tag: 'test',
    rpcUrls: {
      public: { http: additionalRpcUrls[PresetTypedChainId.Sepolia] },
      default: { http: additionalRpcUrls[PresetTypedChainId.Sepolia] },
    },
  }),
  [PresetTypedChainId.AvalancheFuji]: mergeChain(avalancheFuji, {
    chainType: ChainType.EVM,
    group: 'avalanche',
    tag: 'test',
    rpcUrls: {
      public: { http: additionalRpcUrls[PresetTypedChainId.AvalancheFuji] },
      default: { http: additionalRpcUrls[PresetTypedChainId.AvalancheFuji] },
    },
  }),
  [PresetTypedChainId.ScrollAlpha]: mergeChain(scrollTestnet, {
    chainType: ChainType.EVM,
    group: 'scroll',
    tag: 'test',
    contracts: {
      multicall3: {
        address: '0xcA11bde05977b3631167028862bE2a173976CA11',
        blockCreated: 2745641,
      },
    },
    rpcUrls: {
      public: { http: additionalRpcUrls[PresetTypedChainId.ScrollAlpha] },
      default: { http: additionalRpcUrls[PresetTypedChainId.ScrollAlpha] },
    },
  }),

  // Self hosted chains
  [PresetTypedChainId.HermesOrbit]: {
    chainType: ChainType.EVM,
    id: EVMChainId.HermesOrbit,
    name: 'Orbit Hermes',
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
    name: 'Orbit Athena',
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
    name: 'Orbit Demeter',
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

  [PresetTypedChainId.TangleTestnet]: {
    chainType: ChainType.EVM,
    id: EVMChainId.TangleTestnet,
    name: 'Tangle Testnet',
    network: 'Tangle',
    group: 'webb-dev',
    tag: 'test',
    nativeCurrency: {
      name: 'Test Tangle Network Token',
      symbol: 'tTNT',
      decimals: 18,
    },
    blockExplorers: {
      default: {
        name: 'Tangle Testnet Explorer',
        url: 'https://tangle-testnet-explorer.webb.tools',
      },
    },
    rpcUrls: {
      default: {
        http: ['https://tangle-standalone-archive.webb.tools'],
      },
      public: {
        http: ['https://tangle-standalone-archive.webb.tools'],
      },
    },
    env: ['development', 'test'],
    contracts: {
      multicall3: undefined,
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
