import EdgwareLogo from '@webb-dapp/apps/configs/wallets/logos/EdgwareLogo';
import EtherLogo from '@webb-dapp/apps/configs/wallets/logos/Eth';
import { AppConfig } from '@webb-dapp/react-environment';
import React from 'react';

export const currenciesConfig: AppConfig['currencies'] = {
  1: {
    name: 'Edgware token',
    symbol: 'EDG',
    color: '',
    id: 1,
    icon: React.createElement(EdgwareLogo),
  },
  2: {
    name: 'Edgware test token',
    symbol: 'tEDG',
    color: '',
    id: 2,
    icon: React.createElement(EdgwareLogo),
  },
  3: {
    name: 'Ethereum',
    symbol: 'ETH',
    color: '',
    id: 3,
    icon: React.createElement(EtherLogo),
  },
};
