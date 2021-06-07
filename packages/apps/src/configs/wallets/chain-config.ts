import { AppConfig } from '@webb-dapp/react-environment/webb-context';

export const chainsConfig: AppConfig['chains'] = {
  // edgware
  1: {
    id: 1,
    logo: () => null,
    url: 'ws://127.0.0.1:9944',
    name: 'Development',
    currencies: [
      {
        currencyId: 1,
        enabled: true
      }
    ],
    nativeCurrencyId: 1
  },
  2: {
    id: 2,
    name: 'Beresheet (Edgeware Testnet)',
    url: 'wss://beresheet1.edgewa.re',
    logo: () => null,
    currencies: [
      {
        currencyId: 1,
        enabled: true
      }
    ],
    nativeCurrencyId: 1
  },
  3: {
    id: 2,
    name: 'Edgeware',
    url: 'wss://mainnet1.edgewa.re',
    logo: () => null,
    currencies: [
      {
        currencyId: 1,
        enabled: true
      }
    ],
    nativeCurrencyId: 1
  },
  // evm
};