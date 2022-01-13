import ArbitrumLogo from '@webb-dapp/apps/configs/logos/ArbitrumLogo';
import EdgewareLogo from '@webb-dapp/apps/configs/logos/EdgewareLogo';
import EtherLogo from '@webb-dapp/apps/configs/logos/Eth';
import HarmonyLogo from '@webb-dapp/apps/configs/logos/HarmonyLogo';
import OptimismLogo from '@webb-dapp/apps/configs/logos/OptimismLogo';
import ShidenLogo from '@webb-dapp/apps/configs/logos/ShidenLogo';
import { AppConfig } from '@webb-dapp/react-environment/webb-context';

import { WebbCurrencyId } from '../currencies/webb-currency-id.enum';
import PolygonLogo from '../logos/PolygonLogo';
import WEBBLogo from '../logos/WebbLogo';
import { ChainId, WebbEVMChain } from './chain-id.enum';

export const getSupportedCurrenciesOfChain = (chainId: ChainId): WebbCurrencyId[] => {
  return chainsConfig[chainId].currencies.map((entry) => entry.currencyId);
};

export const chainsConfig: AppConfig['chains'] = {
  [ChainId.WebbDevelopment]: {
    id: ChainId.WebbDevelopment,
    group: 'webb',
    tag: 'dev',
    evmId: undefined,
    logo: WEBBLogo,
    url: 'ws://127.0.0.1:9944',
    name: 'Webb Development',
    currencies: [
      {
        currencyId: WebbCurrencyId.WEBB,
        enabled: true,
        address: '0x0000000000000000000000000000000000000000', // special address in smart contract to represent native asset
      },
    ],
    nativeCurrencyId: WebbCurrencyId.WEBB,
  },
  [ChainId.EdgewareTestNet]: {
    group: 'edgeware',
    tag: 'test',
    id: ChainId.EdgewareTestNet,
    evmId: WebbEVMChain.Beresheet,
    name: 'Beresheet (Edgeware Testnet)',
    url: 'wss://beresheet1.edgewa.re',
    evmRpcUrls: ['https://beresheet.edgewa.re/evm'],
    logo: EdgewareLogo,
    currencies: [
      {
        currencyId: WebbCurrencyId.TEDG,
        enabled: true,
        address: '0x0000000000000000000000000000000000000000',
      },
    ],
    nativeCurrencyId: WebbCurrencyId.TEDG,
  },
  // [ChainId.Edgeware]: {
  //   group: 'edgeware',
  //   tag: 'live',
  //   id: ChainId.Edgeware,
  //   evmId: WebbEVMChain.Edgeware,
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

  [ChainId.Rinkeby]: {
    group: 'eth',
    id: ChainId.Rinkeby,
    evmId: WebbEVMChain.Rinkeby,
    name: 'Rinkeby',
    url: 'https://rinkeby.infura.io/v3/e54b7176271840f9ba62e842ff5d6db4',
    evmRpcUrls: ['https://rinkeby.infura.io/v3/e54b7176271840f9ba62e842ff5d6db4'],
    blockExplorerStub: 'https://rinkeby.etherscan.io',
    logo: EtherLogo,
    tag: 'test',
    currencies: [
      {
        currencyId: WebbCurrencyId.ETH,
        enabled: true,
        address: '0x0000000000000000000000000000000000000000',
      },
      {
        currencyId: WebbCurrencyId.WETH,
        enabled: true,
        address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
      },
    ],
    nativeCurrencyId: WebbCurrencyId.ETH,
  },
  [ChainId.Ropsten]: {
    group: 'eth',
    id: ChainId.Ropsten,
    evmId: WebbEVMChain.Ropsten,
    name: 'Ropsten',
    url: 'https://ropsten.infura.io/v3/e54b7176271840f9ba62e842ff5d6db4',
    evmRpcUrls: ['https://ropsten.infura.io/v3/e54b7176271840f9ba62e842ff5d6db4'],
    blockExplorerStub: 'https://ropsten.etherscan.io',
    logo: EtherLogo,
    tag: 'test',
    currencies: [
      {
        currencyId: WebbCurrencyId.ETH,
        enabled: true,
        address: '0x0000000000000000000000000000000000000000',
      },
      {
        currencyId: WebbCurrencyId.WETH,
        enabled: true,
        address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
      },
    ],
    nativeCurrencyId: WebbCurrencyId.ETH,
  },
  [ChainId.Goerli]: {
    group: 'eth',
    id: ChainId.Goerli,
    evmId: WebbEVMChain.Goerli,
    name: 'Goerli',
    url: 'https://goerli.infura.io/v3/e54b7176271840f9ba62e842ff5d6db4',
    evmRpcUrls: ['https://goerli.infura.io/v3/e54b7176271840f9ba62e842ff5d6db4'],
    blockExplorerStub: 'https://goerli.etherscan.io',
    logo: EtherLogo,
    tag: 'test',
    currencies: [
      {
        currencyId: WebbCurrencyId.ETH,
        enabled: true,
        address: '0x0000000000000000000000000000000000000000',
      },
      {
        currencyId: WebbCurrencyId.WETH,
        enabled: true,
        address: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
      },
    ],
    nativeCurrencyId: WebbCurrencyId.ETH,
  },
  [ChainId.Kovan]: {
    group: 'eth',
    id: ChainId.Kovan,
    evmId: WebbEVMChain.Kovan,
    name: 'Kovan',
    url: 'https://kovan.infura.io/v3/e54b7176271840f9ba62e842ff5d6db4',
    evmRpcUrls: ['https://goerli.infura.io/v3/e54b7176271840f9ba62e842ff5d6db4'],
    blockExplorerStub: 'https://kovan.etherscan.io',
    logo: EtherLogo,
    tag: 'test',
    currencies: [
      {
        currencyId: WebbCurrencyId.ETH,
        enabled: true,
        address: '0x0000000000000000000000000000000000000000',
      },
      {
        currencyId: WebbCurrencyId.WETH,
        enabled: true,
        address: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
      },
    ],
    nativeCurrencyId: WebbCurrencyId.ETH,
  },
  [ChainId.OptimismTestnet]: {
    group: 'eth',
    id: ChainId.OptimismTestnet,
    evmId: WebbEVMChain.OptimismTestnet,
    name: 'Optimism Testnet',
    url: 'https://kovan.optimism.io',
    evmRpcUrls: ['https://kovan.optimism.io'],
    blockExplorerStub: 'https://kovan-optimistic.etherscan.io',
    logo: OptimismLogo,
    tag: 'test',
    currencies: [
      {
        currencyId: WebbCurrencyId.ETH,
        enabled: true,
        address: '0x0000000000000000000000000000000000000000',
      },
      {
        currencyId: WebbCurrencyId.WETH,
        enabled: true,
        address: '0xbC6F6b680bc61e30dB47721c6D1c5cde19C1300d',
      },
    ],
    nativeCurrencyId: WebbCurrencyId.ETH,
  },
  [ChainId.ArbitrumTestnet]: {
    group: 'eth',
    id: ChainId.ArbitrumTestnet,
    evmId: WebbEVMChain.ArbitrumTestnet,
    name: 'Arbitrum Testnet',
    url: 'https://rinkeby.arbitrum.io/rpc',
    evmRpcUrls: ['https://rinkeby.arbitrum.io/rpc'],
    blockExplorerStub: 'https://testnet.arbiscan.io',
    logo: ArbitrumLogo,
    tag: 'test',
    currencies: [
      {
        currencyId: WebbCurrencyId.ETH,
        enabled: true,
        address: '0x0000000000000000000000000000000000000000',
      },
      {
        currencyId: WebbCurrencyId.WETH,
        enabled: true,
        address: '0xEBbc3452Cc911591e4F18f3b36727Df45d6bd1f9',
      },
    ],
    nativeCurrencyId: WebbCurrencyId.ETH,
  },
  [ChainId.HarmonyTestnet1]: {
    group: 'one',
    id: ChainId.HarmonyTestnet1,
    evmId: WebbEVMChain.HarmonyTestnet1,
    name: 'Harmony Testnet Shard 1',
    tag: 'test',
    url: 'https://api.s1.b.hmny.io',
    evmRpcUrls: ['https://api.s1.b.hmny.io'],
    logo: HarmonyLogo,
    currencies: [
      {
        currencyId: WebbCurrencyId.ONE,
        enabled: true,
        address: '0x0000000000000000000000000000000000000000',
      },
    ],
    nativeCurrencyId: WebbCurrencyId.ONE,
  },
  // [ChainId.HarmonyTestnet0]: {
  //   group: 'one',
  //   id: ChainId.HarmonyTestnet0,
  //   evmId: WebbEVMChain.HarmonyTestnet0,
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
  [ChainId.HarmonyMainnet0]: {
    group: 'one',
    id: ChainId.HarmonyMainnet0,
    evmId: WebbEVMChain.HarmonyMainnet0,
    name: 'Harmony Mainnet Shard 0',
    tag: 'live',
    url: 'https://api.harmony.one',
    evmRpcUrls: ['https://api.harmony.one'],
    logo: HarmonyLogo,
    currencies: [
      {
        currencyId: WebbCurrencyId.ONE,
        enabled: true,
        address: '0x0000000000000000000000000000000000000000',
      },
    ],
    nativeCurrencyId: WebbCurrencyId.ONE,
  },
  // [ChainId.EthereumMainNet]: {
  //   group: 'eth',
  //   id: ChainId.EthereumMainNet,
  //   evmId: WebbEVMChain.EthereumMainNet,
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
  [ChainId.Shiden]: {
    group: 'sdn',
    id: ChainId.Shiden,
    evmId: WebbEVMChain.Shiden,
    name: 'Shiden',
    tag: 'live',
    url: 'https://shiden.api.onfinality.io/public',
    evmRpcUrls: ['https://shiden.api.onfinality.io/public'],
    blockExplorerStub: 'https://shiden.subscan.io',
    logo: ShidenLogo,
    currencies: [
      {
        currencyId: WebbCurrencyId.SDN,
        enabled: true,
        address: '0x0000000000000000000000000000000000000000',
      },
    ],
    nativeCurrencyId: WebbCurrencyId.SDN,
  },
  [ChainId.PolygonTestnet]: {
    group: 'matic',
    id: ChainId.PolygonTestnet,
    evmId: WebbEVMChain.PolygonTestnet,
    name: 'Polygon Testnet',
    tag: 'test',
    url: 'https://rpc-mumbai.maticvigil.com/',
    evmRpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
    blockExplorerStub: 'https://mumbai.polygonscan.com/',
    logo: PolygonLogo,
    currencies: [
      {
        currencyId: WebbCurrencyId.MATIC,
        enabled: true,
        address: '0x0000000000000000000000000000000000000000',
      },
      {
        currencyId: WebbCurrencyId.WETH,
        enabled: true,
        address: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
      },
    ],
    nativeCurrencyId: WebbCurrencyId.MATIC,
  },
};
