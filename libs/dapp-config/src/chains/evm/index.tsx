// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

// The extra evm rpc urls are from https://github.com/DefiLlama/chainlist

import { EVMChainId, PresetTypedChainId } from '@webb-tools/dapp-types';
import ArbitrumLogo from '@webb-tools/logos/chains/ArbitrumLogo';
import GanacheLogo from '@webb-tools/logos/chains/GanacheLogo';
import { MoonbeamLogo } from '@webb-tools/logos/chains/MoonbeamLogo';
import OptimismLogo from '@webb-tools/logos/chains/OptimismLogo';
import PolygonLogo from '@webb-tools/logos/chains/PolygonLogo';
import EtherLogo from '@webb-tools/logos/Eth';
import { ChainType } from '@webb-tools/sdk-core/typed-chain-id';

import { ChainConfig } from '../chain-config.interface';

const hostedOrbitMulticall3Address =
  process.env.HOSTED_ORBIT_MULTLICALL3_ADDRESS;

const athenaOrbitMulticall3DeploymentBlock = process.env
  .ATHENA_ORBIT_MULTICALL3_DEPLOYMENT_BLOCK
  ? parseInt(process.env.ATHENA_ORBIT_MULTICALL3_DEPLOYMENT_BLOCK)
  : 0;

const hermesOrbitMulticall3DeploymentBlock = process.env
  .HERMES_ORBIT_MULTICALL3_DEPLOYMENT_BLOCK
  ? parseInt(process.env.HERMES_ORBIT_MULTICALL3_DEPLOYMENT_BLOCK)
  : 0;

const demeterOrbitMulticall3DeploymentBlock = process.env
  .DEMETER_ORBIT_MULTICALL3_DEPLOYMENT_BLOCK
  ? parseInt(process.env.DEMETER_ORBIT_MULTICALL3_DEPLOYMENT_BLOCK)
  : 0;

const localOrbitMulticall3Address = process.env.LOCAL_ORBIT_MULTICALL3_ADDRESS;

const localAthenaMulticall3DeploymentBlock = process.env
  .LOCAL_ATHENA_MULTICALL3_DEPLOYMENT_BLOCK
  ? parseInt(process.env.LOCAL_ATHENA_MULTICALL3_DEPLOYMENT_BLOCK)
  : 0;

const localHermesMulticall3DeploymentBlock = process.env
  .LOCAL_HERMES_MULTICALL3_DEPLOYMENT_BLOCK
  ? parseInt(process.env.LOCAL_HERMES_MULTICALL3_DEPLOYMENT_BLOCK)
  : 0;

const localDemeterMulticall3DeploymentBlock = process.env
  .LOCAL_DEMETER_MULTICALL3_DEPLOYMENT_BLOCK
  ? parseInt(process.env.LOCAL_DEMETER_MULTICALL3_DEPLOYMENT_BLOCK)
  : 0;

export const chainsConfig: Record<number, ChainConfig> = {
  // Testnet
  [PresetTypedChainId.Goerli]: {
    chainType: ChainType.EVM,
    group: 'eth',
    chainId: EVMChainId.Goerli,
    name: 'Goerli',
    base: 'ethereum',
    url: 'https://ethereum-goerli.publicnode.com',
    evmRpcUrls: [
      'https://ethereum-goerli.publicnode.com',
      'https://goerli.infura.io/v3',
      'https://rpc.ankr.com/eth_goerli',
      'https://eth-goerli.g.alchemy.com/v2',
    ],
    blockExplorerStub: 'https://goerli.etherscan.io',
    logo: EtherLogo,
    tag: 'test',
  },
  [PresetTypedChainId.OptimismTestnet]: {
    chainType: ChainType.EVM,
    group: 'eth',
    chainId: EVMChainId.OptimismTestnet,
    name: 'Optimism Goerli',
    base: 'optimism',
    url: 'https://goerli.optimism.io',
    evmRpcUrls: [
      'https://goerli.optimism.io',
      'https://endpoints.omniatech.io/v1/op/goerli/public',
      'https://optimism-goerli.infura.io/v3',
      'https://opt-goerli.g.alchemy.com/v2/demo',
    ],
    blockExplorerStub: 'https://blockscout.com/optimism/goerli',
    logo: OptimismLogo,
    tag: 'test',
  },
  [PresetTypedChainId.ArbitrumTestnet]: {
    chainType: ChainType.EVM,
    group: 'eth',
    chainId: EVMChainId.ArbitrumTestnet,
    name: 'Arbitrum Goerli',
    base: 'arbitrum',
    url: 'https://goerli-rollup.arbitrum.io/rpc',
    evmRpcUrls: [
      'https://goerli-rollup.arbitrum.io/rpc',
      'https://arbitrum-goerli.infura.io/v3',
      'https://arb-goerli.g.alchemy.com/v2',
    ],
    blockExplorerStub: 'https://goerli.arbiscan.io/',
    logo: ArbitrumLogo,
    tag: 'test',
  },
  [PresetTypedChainId.PolygonTestnet]: {
    chainType: ChainType.EVM,
    group: 'matic',
    chainId: EVMChainId.PolygonTestnet,
    name: 'Polygon Mumbai',
    base: 'polygon',
    tag: 'test',
    url: 'https://endpoints.omniatech.io/v1/matic/mumbai/public	',
    evmRpcUrls: [
      'https://endpoints.omniatech.io/v1/matic/mumbai/public	',
      'https://polygon-mumbai.infura.io/v3',
      'https://polygon-mumbai.g.alchemy.com/v2',
    ],
    blockExplorerStub: 'https://mumbai.polygonscan.com/',
    logo: PolygonLogo,
  },
  [PresetTypedChainId.MoonbaseAlpha]: {
    chainType: ChainType.EVM,
    group: 'eth',
    chainId: EVMChainId.MoonbaseAlpha,
    name: 'Moonbase Alpha',
    base: 'moonbeam',
    tag: 'test',
    url: 'https://moonbeam-alpha.api.onfinality.io/public',
    evmRpcUrls: [
      'https://moonbeam-alpha.api.onfinality.io/public',
      'https://rpc.api.moonbase.moonbeam.network',
      'https://rpc.testnet.moonbeam.network	',
    ],
    blockExplorerStub: 'https://moonbase.moonscan.io/',
    logo: MoonbeamLogo,
  },
  [PresetTypedChainId.Sepolia]: {
    chainType: ChainType.EVM,
    group: 'eth',
    chainId: EVMChainId.Sepolia,
    name: 'Sepolia',
    base: 'ethereum',
    tag: 'test',
    url: 'https://rpc.sepolia.org',
    blockExplorerStub: 'https://sepolia.etherscan.io/',
    evmRpcUrls: [
      'https://rpc.sepolia.org',
      'https://sepolia.infura.io/v3',
      'https://endpoints.omniatech.io/v1/eth/sepolia/public',
      'https://ethereum-sepolia.blockpi.network/v1/rpc/public',
    ],
    logo: EtherLogo,
  },
  [PresetTypedChainId.AvalancheFuji]: {
    chainType: ChainType.EVM,
    group: 'eth',
    chainId: EVMChainId.AvalancheFuji,
    name: 'Avalanche Fuji',
    base: 'avalanche',
    tag: 'test',
    url: 'https://api.avax-test.network/ext/bc/C/rpc',
    blockExplorerStub: 'https://testnet.snowtrace.io/',
    evmRpcUrls: [
      'https://api.avax-test.network/ext/bc/C/rpc',
      'https://rpc.ankr.com/avalanche_fuji',
      'https://ava-testnet.public.blastapi.io/ext/bc/C/rpc',
    ],
    logo: EtherLogo,
  },
  [PresetTypedChainId.ScrollAlpha]: {
    chainType: ChainType.EVM,
    group: 'eth',
    chainId: EVMChainId.ScrollAlpha,
    name: 'Scroll Alpha',
    base: 'scroll',
    tag: 'test',
    url: 'https://alpha-rpc.scroll.io/l2',
    blockExplorerStub: 'https://blockscout.scroll.io/',
    evmRpcUrls: ['https://alpha-rpc.scroll.io/l2'],
    logo: EtherLogo,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      deployedAt: 2745641,
    },
  },

  // Self hosted chains
  [PresetTypedChainId.HermesOrbit]: {
    chainType: ChainType.EVM,
    group: 'eth',
    chainId: EVMChainId.HermesOrbit,
    name: 'Hermes Orbit',
    base: 'orbit',
    tag: 'test',
    url: 'https://hermes-testnet.webb.tools',
    evmRpcUrls: ['https://hermes-testnet.webb.tools'],
    blockExplorerStub: 'https://hermes-explorer.webb.tools',
    logo: GanacheLogo,
    env: ['development', 'test'],
    multicall3: hostedOrbitMulticall3Address
      ? {
          address: `0x${hostedOrbitMulticall3Address.replace(/^0x/, '')}`,
          deployedAt: hermesOrbitMulticall3DeploymentBlock,
        }
      : undefined,
  },
  [PresetTypedChainId.AthenaOrbit]: {
    chainType: ChainType.EVM,
    group: 'eth',
    chainId: EVMChainId.AthenaOrbit,
    name: 'Athena Orbit',
    base: 'orbit',
    tag: 'test',
    url: 'https://athena-testnet.webb.tools',
    evmRpcUrls: ['https://athena-testnet.webb.tools'],
    blockExplorerStub: 'https://athena-explorer.webb.tools',
    logo: GanacheLogo,
    env: ['development', 'test'],
    multicall3: hostedOrbitMulticall3Address
      ? {
          address: `0x${hostedOrbitMulticall3Address.replace(/^0x/, '')}`,
          deployedAt: athenaOrbitMulticall3DeploymentBlock,
        }
      : undefined,
  },
  [PresetTypedChainId.DemeterOrbit]: {
    chainType: ChainType.EVM,
    group: 'eth',
    chainId: EVMChainId.DemeterOrbit,
    name: 'Demeter Orbit',
    base: 'orbit',
    tag: 'test',
    url: 'https://demeter-testnet.webb.tools',
    evmRpcUrls: ['https://demeter-testnet.webb.tools'],
    blockExplorerStub: 'https://demeter-explorer.webb.tools',
    logo: GanacheLogo,
    env: ['development', 'test'],
    multicall3: hostedOrbitMulticall3Address
      ? {
          address: `0x${hostedOrbitMulticall3Address.replace(/^0x/, '')}`,
          deployedAt: demeterOrbitMulticall3DeploymentBlock,
        }
      : undefined,
  },

  // Localnet
  [PresetTypedChainId.HermesLocalnet]: {
    chainType: ChainType.EVM,
    group: 'eth',
    chainId: EVMChainId.HermesLocalnet,
    name: 'Hermes',
    base: 'webb-dev',
    tag: 'dev',
    url: 'http://127.0.0.1:5004',
    evmRpcUrls: ['http://127.0.0.1:5004'],
    logo: GanacheLogo,
    env: ['development'],
    multicall3: localOrbitMulticall3Address
      ? {
          address: `0x${localOrbitMulticall3Address.replace(/^0x/, '')}`,
          deployedAt: localHermesMulticall3DeploymentBlock,
        }
      : undefined,
  },
  [PresetTypedChainId.AthenaLocalnet]: {
    chainType: ChainType.EVM,
    group: 'eth',
    chainId: EVMChainId.AthenaLocalnet,
    name: 'Athena',
    base: 'webb-dev',
    tag: 'dev',
    url: 'http://127.0.0.1:5005',
    evmRpcUrls: ['http://127.0.0.1:5005'],
    logo: GanacheLogo,
    env: ['development'],
    multicall3: localOrbitMulticall3Address
      ? {
          address: `0x${localOrbitMulticall3Address.replace(/^0x/, '')}`,
          deployedAt: localAthenaMulticall3DeploymentBlock,
        }
      : undefined,
  },
  [PresetTypedChainId.DemeterLocalnet]: {
    chainType: ChainType.EVM,
    group: 'eth',
    chainId: EVMChainId.DemeterLocalnet,
    name: 'Demeter',
    base: 'webb-dev',
    tag: 'dev',
    url: 'http://127.0.0.1:5006',
    evmRpcUrls: ['http://127.0.0.1:5006'],
    logo: GanacheLogo,
    env: ['development'],
    multicall3: localOrbitMulticall3Address
      ? {
          address: `0x${localOrbitMulticall3Address.replace(/^0x/, '')}`,
          deployedAt: localDemeterMulticall3DeploymentBlock,
        }
      : undefined,
  },
};
