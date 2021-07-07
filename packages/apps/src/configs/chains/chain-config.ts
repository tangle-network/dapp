import { AppConfig } from '@webb-dapp/react-environment/webb-context';
import { ChainId, WebbEVMChain } from './chain-id.enum';
import EdgewareLogo from '@webb-dapp/apps/configs/logos/EdgewareLogo';
import EtherLogo from '@webb-dapp/apps/configs/logos/Eth';
import { WebbCurrencyId } from '../currencies/webb-currency-id.enum';

export const chainsConfig: AppConfig['chains'] = {
  // edgware
  [ChainId.EdgewareLocalNet]: {
    id: ChainId.EdgewareLocalNet,
    group: 'edgeware',
    tag: 'dev',
    evmId: undefined,
    logo: EdgewareLogo,
    url: 'ws://127.0.0.1:9944',
    name: 'Edgware Development',
    currencies: [
      {
        currencyId: WebbCurrencyId.EDG,
        enabled: true,
      },
    ],
    nativeCurrencyId: WebbCurrencyId.EDG,
  },
  [ChainId.WebbPrivate] : {
    id: ChainId.WebbPrivate,
    group: 'edgeware',
    tag: 'dev',
    evmId: undefined,
    logo: EdgewareLogo,
    url: 'ws://nepoche.com:9944',
    name: 'Webb Private',
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
    logo: EdgewareLogo,
    currencies: [
      {
        currencyId: WebbCurrencyId.TEDG,
        enabled: true,
      },
    ],
    nativeCurrencyId: WebbCurrencyId.TEDG,
  },
  [ChainId.Edgeware]: {
    group: 'edgeware',
    tag: 'live',
    id: ChainId.Edgeware,
    evmId: undefined,
    name: 'Edgeware',
    url: 'wss://mainnet1.edgewa.re',
    logo: EdgewareLogo,
    currencies: [
      {
        currencyId: WebbCurrencyId.EDG,
        enabled: true,
      },
    ],
    nativeCurrencyId: WebbCurrencyId.EDG,
  },
  // evm
  [ChainId.AnyEvm]: {
    group: 'eth',
    id: ChainId.AnyEvm,
    evmId: undefined,
    name: 'Ethereum',
    url: '',
    logo: EtherLogo,
    currencies: [
      {
        currencyId: WebbCurrencyId.ETH,
        enabled: true,
      },
    ],
    nativeCurrencyId: WebbCurrencyId.ETH,
  },
};
