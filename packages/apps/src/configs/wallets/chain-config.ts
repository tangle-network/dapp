import { AppConfig } from '@webb-dapp/react-environment/webb-context';
import EdgwareLogo from '@webb-dapp/apps/configs/wallets/logos/EdgwareLogo';
import EtherLogo from '@webb-dapp/apps/configs/wallets/logos/Eth';
import { WebbEVMChain } from '@webb-dapp/apps/configs/evm/SupportedMixers';

export const chainsConfig: AppConfig['chains'] = {
  // edgware
  1: {
    id: 1,
    group: 'edgware',
    tag: 'dev',
    evmId: undefined,
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
    evmId: WebbEVMChain.Beresheet,
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
    evmId: undefined,
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
    id: 4,
    evmId: undefined,
    name: 'Ethereum',
    url: '',
    logo: EtherLogo,
    currencies: [
      {
        currencyId: 3,
        enabled: true,
      },
    ],
    nativeCurrencyId: 3,
  },
};
