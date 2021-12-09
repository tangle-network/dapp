import EdgewareLogo from '@webb-dapp/apps/configs/logos/EdgewareLogo';
import EtherLogo from '@webb-dapp/apps/configs/logos/Eth';
import HarmonyLogo from '@webb-dapp/apps/configs/logos/HarmonyLogo';
import ShidenLogo from '@webb-dapp/apps/configs/logos/ShidenLogo';
import WEBBLogo from '@webb-dapp/apps/configs/logos/WebbLogo';
import { AppConfig } from '@webb-dapp/react-environment';
import React from 'react';

import { WebbNativeCurrencyId } from './webb-currency-id.enum';

export const currenciesConfig: AppConfig['currencies'] = {
  [WebbNativeCurrencyId.EDG]: {
    name: 'Edgeware token',
    symbol: 'EDG',
    color: '',
    id: WebbNativeCurrencyId.EDG,
    icon: React.createElement(EdgewareLogo),
  },
  [WebbNativeCurrencyId.TEDG]: {
    name: 'Edgeware testnet token',
    symbol: 'tEDG',
    color: '',
    id: WebbNativeCurrencyId.TEDG,
    icon: React.createElement(EdgewareLogo),
  },
  [WebbNativeCurrencyId.ETH]: {
    name: 'Ethereum',
    symbol: 'ETH',
    color: '',
    id: WebbNativeCurrencyId.ETH,
    icon: React.createElement(EtherLogo),
  },
  [WebbNativeCurrencyId.ONE]: {
    name: 'Harmony',
    symbol: 'ONE',
    color: '',
    id: WebbNativeCurrencyId.ONE,
    icon: React.createElement(HarmonyLogo),
  },
  [WebbNativeCurrencyId.WEBB]: {
    name: 'WEBB',
    symbol: 'WEBB',
    color: '',
    id: WebbNativeCurrencyId.WEBB,
    icon: React.createElement(WEBBLogo),
  },
  [WebbNativeCurrencyId.SDN]: {
    name: 'Shiden',
    symbol: 'SDN',
    color: '',
    id: WebbNativeCurrencyId.SDN,
    icon: React.createElement(ShidenLogo),
  },
};
