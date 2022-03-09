import ArbitrumLogo from '@webb-dapp/apps/configs/logos/ArbitrumLogo';
import EdgewareLogo from '@webb-dapp/apps/configs/logos/EdgewareLogo';
import EtherLogo from '@webb-dapp/apps/configs/logos/Eth';
import HarmonyLogo from '@webb-dapp/apps/configs/logos/HarmonyLogo';
import OptimismLogo from '@webb-dapp/apps/configs/logos/OptimismLogo';
import PolygonLogo from '@webb-dapp/apps/configs/logos/PolygonLogo';
import ShidenLogo from '@webb-dapp/apps/configs/logos/ShidenLogo';
import WEBBLogo from '@webb-dapp/apps/configs/logos/WebbLogo';
import { AppConfig } from '@webb-dapp/react-environment/webb-context';

import { WebbCurrencyId } from '../currencies/webb-currency-id.enum';
import GanacheLogo from '../logos/GanacheLogo';
import { ChainType, EVMChainId, InternalChainId, SubstrateChainId } from './chain-id.enum';

export const getSupportedCurrenciesOfChain = (chainId: InternalChainId): WebbCurrencyId[] => {
  return chainsConfig[chainId].currencies;
};

export const chainsConfig: AppConfig['chains'] = {
  [InternalChainId.WebbDevelopment]: {
    chainType: ChainType.Substrate,
    id: InternalChainId.WebbDevelopment,
    group: 'webb',
    tag: 'dev',
    chainId: SubstrateChainId.Webb,
    logo: WEBBLogo,
    url: 'ws://127.0.0.1:9944',
    name: 'Webb Development',
    currencies: [WebbCurrencyId.WEBB],
    nativeCurrencyId: WebbCurrencyId.WEBB,
  },
  // this is the EVM edgeware
  [InternalChainId.EdgewareTestNet]: {
    chainType: ChainType.EVM,
    group: 'edgeware',
    tag: 'test',
    id: InternalChainId.EdgewareTestNet,
    chainId: EVMChainId.Beresheet,
    name: 'Beresheet (Edgeware Testnet)',
    url: 'wss://beresheet1.edgewa.re',
    evmRpcUrls: ['https://beresheet.edgewa.re/evm'],
    logo: EdgewareLogo,
    currencies: [WebbCurrencyId.TEDG],
    nativeCurrencyId: WebbCurrencyId.TEDG,
  },
  // [ChainId.Edgeware]: {
  // chainType: ChainType,
  //   group: 'edgeware',
  //   tag: 'live',
  //   id: ChainId.Edgeware,
  //   evmId: EVMChain.Edgeware,
  //   name: 'Edgeware',
  //   evmRpcUrls: ['https://mainnet.edgewa.re/evm'],
  //   url: 'wss://mainnet1.edgewa.re',
  //   logo: EdgewareLogo,
  //   currencies: [
  //     {
  //       currencyId: WebbCurrencyId.EDG,
  //       enabled: true,
  //     },
  //   ],
  //   nativeCurrencyId: WebbCurrencyId.EDG,
  // },

  [InternalChainId.Rinkeby]: {
    chainType: ChainType.EVM,
    group: 'eth',
    id: InternalChainId.Rinkeby,
    chainId: EVMChainId.Rinkeby,
    name: 'Rinkeby',
    url: 'https://rinkeby.infura.io/v3/e54b7176271840f9ba62e842ff5d6db4',
    evmRpcUrls: ['https://rinkeby.infura.io/v3/e54b7176271840f9ba62e842ff5d6db4'],
    blockExplorerStub: 'https://rinkeby.etherscan.io',
    logo: EtherLogo,
    tag: 'test',
    currencies: [WebbCurrencyId.ETH, WebbCurrencyId.WETH],
    nativeCurrencyId: WebbCurrencyId.ETH,
  },
  [InternalChainId.Ropsten]: {
    chainType: ChainType.EVM,
    group: 'eth',
    id: InternalChainId.Ropsten,
    chainId: EVMChainId.Ropsten,
    name: 'Ropsten',
    url: 'https://ropsten.infura.io/v3/e54b7176271840f9ba62e842ff5d6db4',
    evmRpcUrls: ['https://ropsten.infura.io/v3/e54b7176271840f9ba62e842ff5d6db4'],
    blockExplorerStub: 'https://ropsten.etherscan.io',
    logo: EtherLogo,
    tag: 'test',
    currencies: [WebbCurrencyId.ETH, WebbCurrencyId.WETH],
    nativeCurrencyId: WebbCurrencyId.ETH,
  },
  [InternalChainId.Goerli]: {
    chainType: ChainType.EVM,
    group: 'eth',
    id: InternalChainId.Goerli,
    chainId: EVMChainId.Goerli,
    name: 'Goerli',
    url: 'https://goerli.infura.io/v3/e54b7176271840f9ba62e842ff5d6db4',
    evmRpcUrls: ['https://goerli.infura.io/v3/e54b7176271840f9ba62e842ff5d6db4'],
    blockExplorerStub: 'https://goerli.etherscan.io',
    logo: EtherLogo,
    tag: 'test',
    currencies: [WebbCurrencyId.ETH, WebbCurrencyId.WETH],
    nativeCurrencyId: WebbCurrencyId.ETH,
  },
  [InternalChainId.Kovan]: {
    chainType: ChainType.EVM,
    group: 'eth',
    id: InternalChainId.Kovan,
    chainId: EVMChainId.Kovan,
    name: 'Kovan',
    url: 'https://kovan.infura.io/v3/e54b7176271840f9ba62e842ff5d6db4',
    evmRpcUrls: ['https://goerli.infura.io/v3/e54b7176271840f9ba62e842ff5d6db4'],
    blockExplorerStub: 'https://kovan.etherscan.io',
    logo: EtherLogo,
    tag: 'test',
    currencies: [WebbCurrencyId.ETH, WebbCurrencyId.WETH],
    nativeCurrencyId: WebbCurrencyId.ETH,
  },
  [InternalChainId.OptimismTestnet]: {
    chainType: ChainType.EVM,
    group: 'eth',
    id: InternalChainId.OptimismTestnet,
    chainId: EVMChainId.OptimismTestnet,
    name: 'Optimism Testnet',
    url: 'https://kovan.optimism.io',
    evmRpcUrls: ['https://kovan.optimism.io'],
    blockExplorerStub: 'https://kovan-optimistic.etherscan.io',
    logo: OptimismLogo,
    tag: 'test',
    currencies: [WebbCurrencyId.ETH, WebbCurrencyId.WETH],
    nativeCurrencyId: WebbCurrencyId.ETH,
  },
  [InternalChainId.ArbitrumTestnet]: {
    chainType: ChainType.EVM,
    group: 'eth',
    id: InternalChainId.ArbitrumTestnet,
    chainId: EVMChainId.ArbitrumTestnet,
    name: 'Arbitrum Testnet',
    url: 'https://rinkeby.arbitrum.io/rpc',
    evmRpcUrls: ['https://rinkeby.arbitrum.io/rpc'],
    blockExplorerStub: 'https://testnet.arbiscan.io',
    logo: ArbitrumLogo,
    tag: 'test',
    currencies: [WebbCurrencyId.ETH, WebbCurrencyId.WETH],
    nativeCurrencyId: WebbCurrencyId.ETH,
  },
  [InternalChainId.HarmonyTestnet1]: {
    chainType: ChainType.EVM,
    group: 'one',
    id: InternalChainId.HarmonyTestnet1,
    chainId: EVMChainId.HarmonyTestnet1,
    name: 'Harmony Testnet Shard 1',
    tag: 'test',
    url: 'https://api.s1.b.hmny.io',
    evmRpcUrls: ['https://api.s1.b.hmny.io'],
    logo: HarmonyLogo,
    currencies: [WebbCurrencyId.ONE],
    nativeCurrencyId: WebbCurrencyId.ONE,
  },
  // [ChainId.HarmonyTestnet0]: {
  // chainType: ChainType,
  //   group: 'one',
  //   id: ChainId.HarmonyTestnet0,
  //   evmId: EVMChain.HarmonyTestnet0,
  //   name: 'Harmony Testnet Shard 0',
  //   tag: 'test',
  //   url: 'https://api.s0.b.hmny.io',
  //   evmRpcUrls: ['https://api.s0.b.hmny.io'],
  //   logo: HarmonyLogo,
  //   currencies: [
  //     {
  //       currencyId: WebbCurrencyId.ONE,
  //       enabled: true,
  //     },
  //   ],
  //   nativeCurrencyId: WebbCurrencyId.ONE,
  // },
  [InternalChainId.HarmonyMainnet0]: {
    chainType: ChainType.EVM,
    group: 'one',
    id: InternalChainId.HarmonyMainnet0,
    chainId: EVMChainId.HarmonyMainnet0,
    name: 'Harmony Mainnet Shard 0',
    tag: 'live',
    url: 'https://api.harmony.one',
    evmRpcUrls: ['https://api.harmony.one'],
    logo: HarmonyLogo,
    currencies: [WebbCurrencyId.ONE],
    nativeCurrencyId: WebbCurrencyId.ONE,
  },
  // [ChainId.EthereumMainNet]: {
  // chainType: ChainType,
  //   group: 'eth',
  //   id: ChainId.EthereumMainNet,
  //   evmId: EVMChain.EthereumMainNet,
  //   name: 'Ethereum mainnet',
  //   tag: 'live',
  //   url: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  //   evmRpcUrls: ['https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
  //   logo: EtherLogo,
  //   currencies: [
  //     {
  //       currencyId: WebbCurrencyId.ETH,
  //       enabled: true,
  //     },
  //   ],
  //   nativeCurrencyId: WebbCurrencyId.ETH,
  // },
  [InternalChainId.Shiden]: {
    chainType: ChainType.EVM,
    group: 'sdn',
    id: InternalChainId.Shiden,
    chainId: EVMChainId.Shiden,
    name: 'Shiden',
    tag: 'live',
    url: 'https://shiden.api.onfinality.io/public',
    evmRpcUrls: ['https://shiden.api.onfinality.io/public'],
    blockExplorerStub: 'https://shiden.subscan.io',
    logo: ShidenLogo,
    currencies: [WebbCurrencyId.SDN],
    nativeCurrencyId: WebbCurrencyId.SDN,
  },
  [InternalChainId.PolygonTestnet]: {
    chainType: ChainType.EVM,
    group: 'matic',
    id: InternalChainId.PolygonTestnet,
    chainId: EVMChainId.PolygonTestnet,
    name: 'Polygon Testnet',
    tag: 'test',
    url: 'https://rpc-mumbai.maticvigil.com/',
    evmRpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
    blockExplorerStub: 'https://mumbai.polygonscan.com/',
    logo: PolygonLogo,
    currencies: [WebbCurrencyId.MATIC, WebbCurrencyId.WETH],
    nativeCurrencyId: WebbCurrencyId.MATIC,
  },
  [InternalChainId.HermesLocalnet]: {
    chainType: ChainType.EVM,
    group: 'eth',
    id: InternalChainId.HermesLocalnet,
    chainId: EVMChainId.HermesLocalnet,
    name: 'Hermes Localnet',
    tag: 'dev',
    url: 'http://127.0.0.1:5001',
    evmRpcUrls: ['http://127.0.0.1:5001'],
    logo: GanacheLogo,
    currencies: [WebbCurrencyId.ETH, WebbCurrencyId.DEV],
    nativeCurrencyId: WebbCurrencyId.ETH,
  },
  [InternalChainId.AthenaLocalnet]: {
    chainType: ChainType.EVM,
    group: 'eth',
    id: InternalChainId.AthenaLocalnet,
    chainId: EVMChainId.AthenaLocalnet,
    name: 'Athena Localnet',
    tag: 'dev',
    url: 'http://127.0.0.1:5002',
    evmRpcUrls: ['http://127.0.0.1:5002'],
    logo: GanacheLogo,
    currencies: [WebbCurrencyId.ETH, WebbCurrencyId.DEV],
    nativeCurrencyId: WebbCurrencyId.ETH,
  },
};
