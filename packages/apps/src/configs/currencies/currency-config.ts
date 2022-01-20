import { ChainId } from '@webb-dapp/apps/configs/chains';
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
    addresses: new Map(),
  },
  [WebbCurrencyId.TEDG]: {
    name: 'Edgeware testnet token',
    symbol: 'tEDG',
    color: '',
    id: WebbCurrencyId.TEDG,
    icon: React.createElement(EdgewareLogo),
    addresses: new Map(),
  },
  [WebbCurrencyId.ETH]: {
    name: 'Ethereum',
    symbol: 'ETH',
    color: '',
    id: WebbCurrencyId.ETH,
    icon: React.createElement(EtherLogo),
    addresses: new Map([
      [ChainId.Ropsten, '0x0000000000000000000000000000000000000000'],
      [ChainId.Rinkeby, '0x0000000000000000000000000000000000000000'],
      [ChainId.Goerli, '0x0000000000000000000000000000000000000000'],
      [ChainId.Kovan, '0x0000000000000000000000000000000000000000'],
      [ChainId.OptimismTestnet, '0x0000000000000000000000000000000000000000'],
      [ChainId.ArbitrumTestnet, '0x0000000000000000000000000000000000000000'],
    ]),
  },
  [WebbCurrencyId.ONE]: {
    name: 'Harmony',
    symbol: 'ONE',
    color: '',
    id: WebbCurrencyId.ONE,
    icon: React.createElement(HarmonyLogo),
    addresses: new Map([
      [ChainId.HarmonyMainnet0, '0x0000000000000000000000000000000000000000'],
      [ChainId.HarmonyTestnet0, '0x0000000000000000000000000000000000000000'],
      [ChainId.HarmonyTestnet1, '0x0000000000000000000000000000000000000000'],
    ]),
  },
  [WebbCurrencyId.WEBB]: {
    name: 'WEBB',
    symbol: 'WEBB',
    color: '',
    id: WebbCurrencyId.WEBB,
    icon: React.createElement(WEBBLogo),
    addresses: new Map(),
  },
  [WebbCurrencyId.SDN]: {
    name: 'Shiden',
    symbol: 'SDN',
    color: '',
    id: WebbCurrencyId.SDN,
    icon: React.createElement(ShidenLogo),
    addresses: new Map([[ChainId.Shiden, '0x0000000000000000000000000000000000000000']]),
  },
  [WebbCurrencyId.WETH]: {
    name: 'Wrapped Ethereum',
    symbol: 'WETH',
    color: '',
    id: WebbCurrencyId.WETH,
    icon: React.createElement(EtherLogo),
    addresses: new Map([
      [ChainId.Ropsten, '0xc778417E063141139Fce010982780140Aa0cD5Ab'],
      [ChainId.Rinkeby, '0xc778417E063141139Fce010982780140Aa0cD5Ab'],
      [ChainId.Goerli, '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'],
      [ChainId.Kovan, '0xd0A1E359811322d97991E03f863a0C30C2cF029C'],
      [ChainId.OptimismTestnet, '0xbC6F6b680bc61e30dB47721c6D1c5cde19C1300d'],
      [ChainId.ArbitrumTestnet, '0xEBbc3452Cc911591e4F18f3b36727Df45d6bd1f9'],
      [ChainId.PolygonTestnet, '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889'],
    ]),
  },
  [WebbCurrencyId.MATIC]: {
    name: 'Polygon',
    symbol: 'MATIC',
    color: '',
    id: WebbCurrencyId.MATIC,
    icon: React.createElement(PolygonLogo),
    addresses: new Map([[ChainId.PolygonTestnet, '0x0000000000000000000000000000000000000000']]),
  },
};
