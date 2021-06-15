import { AppConfig } from '@webb-dapp/react-environment/webb-context';
import EdgwareLogo from '@webb-dapp/apps/configs/wallets/logos/EdgwareLogo';
import EtherLogo from '@webb-dapp/apps/configs/wallets/logos/Eth';

export const chainsConfig: AppConfig['chains'] = {
  // edgware
  1: {
    id: 1,
    group: 'edgware',
    tag: 'dev',
    logo: EdgwareLogo,
    url: 'ws://127.0.0.1:9944',
    name: 'Edgware Development',
    currencies: [
      {
        currencyId: 1,
        enabled: true,
      },
    ],
    nativeCurrencyId: 1,
  },
  2: {
    group: 'edgware',
    tag: 'test',
    id: 2,
    name: 'Beresheet (Edgeware Testnet)',
    url: 'wss://beresheet1.edgewa.re',
    logo: EdgwareLogo,
    currencies: [
      {
        currencyId: 1,
        enabled: true,
      },
    ],
    nativeCurrencyId: 1,
  },
  3: {
    group: 'edgware',
    tag: 'live',
    id: 3,
    name: 'Edgeware',
    url: 'wss://mainnet1.edgewa.re',
    logo: EdgwareLogo,
    currencies: [
      {
        currencyId: 1,
        enabled: true,
      },
    ],
    nativeCurrencyId: 1,
  },
  // evm
  4: {
    group: 'eth',
    tag: 'live',
    id: 4,
    name: 'Ethereum',
    url: 'n/a',
    logo: EtherLogo,
    currencies: [
      {
        currencyId: 1,
        enabled: true,
      },
    ],
    nativeCurrencyId: 1,
  },
};
