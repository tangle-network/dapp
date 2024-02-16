// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { EVMChainId, PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';
import { ChainType } from '@webb-tools/sdk-core/typed-chain-id';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import mergeWith from 'lodash/mergeWith';
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
} from 'viem/chains';
import { DEFAULT_EVM_CURRENCY } from '../../currencies';
import type { ChainConfig, WebbExtendedChain } from '../chain-config.interface';

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
            url: 'https://testnet-explorer.tangle.tools/',
          },
        }
      : undefined,
    rpcUrls: {
      default: {
        http: process.env['USING_LOCAL_TANGLE']
          ? ['http://localhost:9944']
          : ['https://testnet-rpc.tangle.tools'],
      },
      public: {
        http: process.env['USING_LOCAL_TANGLE']
          ? ['http://localhost:9944']
          : ['https://testnet-rpc.tangle.tools'],
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
