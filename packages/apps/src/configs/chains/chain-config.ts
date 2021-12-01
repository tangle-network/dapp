import EdgewareLogo from '@webb-dapp/apps/configs/logos/EdgewareLogo';
import EtherLogo from '@webb-dapp/apps/configs/logos/Eth';
import HarmonyLogo from '@webb-dapp/apps/configs/logos/HarmonyLogo';
import ShidenLogo from '@webb-dapp/apps/configs/logos/ShidenLogo';
import { AppConfig } from '@webb-dapp/react-environment/webb-context';

import { WebbCurrencyId } from '../currencies/webb-currency-id.enum';
import ArbitrumLogo from '../logos/ArbitrumLogo';
import { ChainId, WebbEVMChain } from './chain-id.enum';

export const chainsConfig: AppConfig['chains'] = {
  [ChainId.EdgewareLocalNet]: {
    id: ChainId.EdgewareLocalNet,
    group: 'edgeware',
    tag: 'dev',
    evmId: undefined,
    logo: EdgewareLogo,
    url: 'ws://127.0.0.1:9944',
    name: 'Edgeware Development',
    currencies: [
      {
        currencyId: WebbCurrencyId.EDG,
        enabled: true,
      },
    ],
    nativeCurrencyId: WebbCurrencyId.EDG,
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
    logo: EtherLogo,
    tag: 'test',
    currencies: [
      {
        currencyId: WebbCurrencyId.ETH,
        enabled: true,
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
    logo: EtherLogo,
    tag: 'test',
    currencies: [
      {
        currencyId: WebbCurrencyId.ETH,
        enabled: true,
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
    logo: EtherLogo,
    tag: 'test',
    currencies: [
      {
        currencyId: WebbCurrencyId.ETH,
        enabled: true,
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
    logo: EtherLogo,
    tag: 'test',
    currencies: [
      {
        currencyId: WebbCurrencyId.ETH,
        enabled: true,
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
    logo: EtherLogo,
    tag: 'test',
    currencies: [
      {
        currencyId: WebbCurrencyId.ETH,
        enabled: true,
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
    logo: ArbitrumLogo,
    tag: 'test',
    currencies: [
      {
        currencyId: WebbCurrencyId.ETH,
        enabled: true,
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
    logo: ShidenLogo,
    currencies: [
      {
        currencyId: WebbCurrencyId.SDN,
        enabled: true,
      },
    ],
    nativeCurrencyId: WebbCurrencyId.SDN,
  },
};
