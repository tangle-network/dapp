import { AppConfig } from '@webb-dapp/react-environment';
import React from 'react';
import { WebbCurrencyId } from './webb-currency-id.enum';
import EdgwareLogo from '@webb-dapp/apps/configs/logos/EdgwareLogo';
import EtherLogo from '@webb-dapp/apps/configs/logos/Eth';

export const currenciesConfig: AppConfig['currencies'] = {
  [WebbCurrencyId.EDG]: {
    name: 'Edgware token',
    symbol: 'EDG',
    color: '',
    id: WebbCurrencyId.EDG,
    icon: React.createElement(EdgwareLogo),
  },
  [WebbCurrencyId.TEDG]: {
    name: 'Edgware test token',
    symbol: 'tEDG',
    color: '',
    id: WebbCurrencyId.TEDG,
    icon: React.createElement(EdgwareLogo),
  },
  [WebbCurrencyId.ETH]: {
    name: 'Ethereum',
    symbol: 'ETH',
    color: '',
    id: WebbCurrencyId.ETH,
    icon: React.createElement(EtherLogo),
  },
};
