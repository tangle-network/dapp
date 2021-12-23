import EdgewareLogo from '@webb-dapp/apps/configs/logos/EdgewareLogo';
import EtherLogo from '@webb-dapp/apps/configs/logos/Eth';
import HarmonyLogo from '@webb-dapp/apps/configs/logos/HarmonyLogo';
import PolygonLogo from '@webb-dapp/apps/configs/logos/PolygonLogo';
import ShidenLogo from '@webb-dapp/apps/configs/logos/ShidenLogo';
import WEBBLogo from '@webb-dapp/apps/configs/logos/WebbLogo';
import { AppConfig } from '@webb-dapp/react-environment';
import React from 'react';

import { WebbCurrencyId } from './webb-currency-id.enum';

export const currenciesConfig: AppConfig['currencies'] = {
  [WebbCurrencyId.EDG]: {
    name: 'Edgeware token',
    symbol: 'EDG',
    color: '',
    id: WebbCurrencyId.EDG,
    icon: React.createElement(EdgewareLogo),
  },
  [WebbCurrencyId.TEDG]: {
    name: 'Edgeware testnet token',
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
  [WebbCurrencyId.WEBB]: {
    name: 'WEBB',
    symbol: 'WEBB',
    color: '',
    id: WebbCurrencyId.WEBB,
    icon: React.createElement(WEBBLogo),
  },
  [WebbCurrencyId.SDN]: {
    name: 'Shiden',
    symbol: 'SDN',
    color: '',
    id: WebbCurrencyId.SDN,
    icon: React.createElement(ShidenLogo),
  },
  [WebbCurrencyId.WETH]: {
    name: 'WETH',
    symbol: 'WETH',
    color: '',
    id: WebbCurrencyId.WETH,
    icon: React.createElement(EtherLogo),
  },
  [WebbCurrencyId.MATIC]: {
    name: 'MATIC',
    symbol: 'MATIC',
    color: '',
    id: WebbCurrencyId.MATIC,
    icon: React.createElement(PolygonLogo),
  },
};
