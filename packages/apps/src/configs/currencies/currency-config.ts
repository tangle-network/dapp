import { ChainId } from '@webb-dapp/apps/configs/chains';
import EdgewareLogo from '@webb-dapp/apps/configs/logos/EdgewareLogo';
import EtherLogo from '@webb-dapp/apps/configs/logos/Eth';
import HarmonyLogo from '@webb-dapp/apps/configs/logos/HarmonyLogo';
import PolygonLogo from '@webb-dapp/apps/configs/logos/PolygonLogo';
import ShidenLogo from '@webb-dapp/apps/configs/logos/ShidenLogo';
import WEBBLogo from '@webb-dapp/apps/configs/logos/WebbLogo';
import WebbWrappedLogo from '@webb-dapp/apps/configs/logos/WebbWrappedLogo';
import { zeroAddress } from '@webb-dapp/contracts/contracts';
import { AppConfig } from '@webb-dapp/react-environment';
import { CurrencyType } from '@webb-dapp/react-environment/types/currency-config.interface';
import React from 'react';

import { WebbCurrencyId } from './webb-currency-id.enum';

export const currenciesConfig: AppConfig['currencies'] = {
  [WebbCurrencyId.EDG]: {
    name: 'Edgeware token',
    symbol: 'EDG',
    color: '',
    id: WebbCurrencyId.EDG,
    type: CurrencyType.ORML,
    icon: React.createElement(EdgewareLogo),
    addresses: new Map(),
  },
  [WebbCurrencyId.TEDG]: {
    name: 'Edgeware testnet token',
    symbol: 'tEDG',
    color: '',
    id: WebbCurrencyId.TEDG,
    type: CurrencyType.ORML,
    icon: React.createElement(EdgewareLogo),
    addresses: new Map(),
  },
  [WebbCurrencyId.ETH]: {
    name: 'Ethereum',
    symbol: 'ETH',
    color: '',
    id: WebbCurrencyId.ETH,
    type: CurrencyType.NativeEvm,
    icon: React.createElement(EtherLogo),
    addresses: new Map([
      [ChainId.Ropsten, zeroAddress],
      [ChainId.Rinkeby, zeroAddress],
      [ChainId.Goerli, zeroAddress],
      [ChainId.Kovan, zeroAddress],
      [ChainId.OptimismTestnet, zeroAddress],
      [ChainId.ArbitrumTestnet, zeroAddress],
    ]),
  },
  [WebbCurrencyId.ONE]: {
    name: 'Harmony',
    symbol: 'ONE',
    color: '',
    id: WebbCurrencyId.ONE,
    type: CurrencyType.NativeEvm,
    icon: React.createElement(HarmonyLogo),
    addresses: new Map([
      [ChainId.HarmonyMainnet0, zeroAddress],
      [ChainId.HarmonyTestnet0, zeroAddress],
      [ChainId.HarmonyTestnet1, zeroAddress],
    ]),
  },
  [WebbCurrencyId.WEBB]: {
    name: 'WEBB',
    symbol: 'WEBB',
    color: '',
    id: WebbCurrencyId.WEBB,
    type: CurrencyType.ORML,
    icon: React.createElement(WEBBLogo),
    addresses: new Map(),
  },
  [WebbCurrencyId.SDN]: {
    name: 'Shiden',
    symbol: 'SDN',
    color: '',
    id: WebbCurrencyId.SDN,
    type: CurrencyType.NativeEvm,
    icon: React.createElement(ShidenLogo),
    addresses: new Map([[ChainId.Shiden, zeroAddress]]),
  },
  [WebbCurrencyId.WETH]: {
    name: 'Wrapped Ethereum',
    symbol: 'WETH',
    color: '',
    id: WebbCurrencyId.WETH,
    type: CurrencyType.Erc20,
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
    type: CurrencyType.NativeEvm,
    icon: React.createElement(PolygonLogo),
    addresses: new Map([[ChainId.PolygonTestnet, zeroAddress]]),
  },
  [WebbCurrencyId.webbWETH]: {
    name: 'webbETH-test-1',
    symbol: 'webbWETH',
    color: '',
    id: WebbCurrencyId.webbWETH,
    type: CurrencyType.BridgeErc20,
    icon: WebbWrappedLogo(EtherLogo()),
    addresses: new Map([
      [ChainId.Ropsten, '0x105779076d17FAe5EAADF010CA677475549F49E4'],
      [ChainId.Rinkeby, '0x4e7D4BEe028655F2865d9D147cF7B609c516d39C'],
      [ChainId.Goerli, '0x5257c558c246311552A824c491285667B3a445a2'],
      [ChainId.PolygonTestnet, '0x50A7b748F3C50F808a289cA041E48834A41A6d95'],
      [ChainId.OptimismTestnet, '0xEAF873F1F6c91fEf73d4839b5fC7954554BBE518'],
      [ChainId.ArbitrumTestnet, '0xD6F1E78B5F1Ebf8fF5a60C9d52eabFa73E5c5220'],
    ]),
  },
};

// on startup build a new map
// currency Address => currency ID
const createReverseCurrencyMap = (): Map<string, WebbCurrencyId> => {
  let contractMapping = new Map<string, WebbCurrencyId>();

  Object.values(currenciesConfig).forEach((config) => {
    config.addresses.forEach((addressEntry) => {
      contractMapping.set(addressEntry, config.id as WebbCurrencyId);
    });
  });

  return contractMapping;
};

export const reverseCurrencyMap = createReverseCurrencyMap();
