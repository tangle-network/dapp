import { AppConfig } from '@webb-dapp/react-environment/webb-context';
import { ChainId, WebbEVMChain } from './chain-id.enum';
import EdgwareLogo from '@webb-dapp/apps/configs/logos/EdgwareLogo';
import EtherLogo from '@webb-dapp/apps/configs/logos/Eth';
import { WebbCurrencyId } from '../currencies/webb-currency-id.enum';

export const chainsConfig: AppConfig['chains'] = {
  // edgware
  [ChainId.EdgwareLocalNet]: {
    id: ChainId.EdgwareLocalNet,
    group: 'edgware',
    tag: 'dev',
    evmId: undefined,
    logo: EdgwareLogo,
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
  [ChainId.EdgwareTestNet]: {
    group: 'edgware',
    tag: 'test',
    id: ChainId.EdgwareTestNet,
    evmId: WebbEVMChain.Beresheet,
    name: 'Beresheet (Edgeware Testnet)',
    url: 'wss://beresheet1.edgewa.re',
    evmRpcUrls: ['https://beresheet1.edgewa.re:9933/'],
    logo: EdgwareLogo,
    currencies: [
      {
        currencyId: WebbCurrencyId.TEDG,
        enabled: true,
      },
    ],
    nativeCurrencyId: WebbCurrencyId.TEDG,
  },
  [ChainId.Edgware]: {
    group: 'edgware',
    tag: 'live',
    id: ChainId.Edgware,
    evmId: undefined,
    name: 'Edgeware',
    url: 'wss://mainnet1.edgewa.re',
    logo: EdgwareLogo,
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
