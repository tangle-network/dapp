import { AppConfig } from '@webb-dapp/react-environment';
import React from 'react';
import { WebbCurrencyId } from './webb-currency-id.enum';
import EdgewareLogo from '@webb-dapp/apps/configs/logos/EdgewareLogo';
import EtherLogo from '@webb-dapp/apps/configs/logos/Eth';
import { HarmonyLogo } from '@webb-dapp/apps/configs/logos/HarmonyLogo';

export const currenciesConfig: AppConfig['currencies'] = {
  [WebbCurrencyId.EDG]: {
    name: 'Edgware token',
    symbol: 'EDG',
    color: '',
    id: WebbCurrencyId.EDG,
    icon: React.createElement(EdgewareLogo),
  },
  [WebbCurrencyId.TEDG]: {
    name: 'Edgware test token',
    symbol: 'tEDG',
    color: '',
    id: WebbCurrencyId.TEDG,
    icon: React.createElement(EdgewareLogo),
  },
  [WebbCurrencyId.ETH]: {
    name: 'Ethereum',
    symbol: 'ETH',
    color: '',
    id: WebbCurrencyId.ETH,
    icon: React.createElement(EtherLogo),
  },
  [WebbCurrencyId.ONE]: {
    name: 'Harmony',
    symbol: 'ONE',
    color: '',
    id: WebbCurrencyId.ONE,
    icon: React.createElement(HarmonyLogo),
  },
};
