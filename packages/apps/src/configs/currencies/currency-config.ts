import { ChainType, InternalChainId } from '@webb-dapp/apps/configs/chains';
import EdgewareLogo from '@webb-dapp/apps/configs/logos/chains/EdgewareLogo';
import HarmonyLogo from '@webb-dapp/apps/configs/logos/chains/HarmonyLogo';
import PolygonLogo from '@webb-dapp/apps/configs/logos/chains/PolygonLogo';
import ShidenLogo from '@webb-dapp/apps/configs/logos/chains/ShidenLogo';
import WEBBLogo from '@webb-dapp/apps/configs/logos/chains/WebbLogo';
import EtherLogo from '@webb-dapp/apps/configs/logos/Eth';
import WebbWrappedLogo from '@webb-dapp/apps/configs/logos/WebbWrappedLogo';
import { AppConfig } from '@webb-tools/api-providers';
import { ZERO, zeroAddress } from '@webb-tools/api-providers/contracts';
import { CurrencyRole, CurrencyType } from '@webb-tools/api-providers/types/currency-config.interface';
import React from 'react';

import { WebbCurrencyId } from './webb-currency-id.enum';

export const currenciesConfig: AppConfig['currencies'] = {
  [WebbCurrencyId.EDG]: {
    name: 'Edgeware token',
    symbol: 'EDG',
    color: '',
    id: WebbCurrencyId.EDG,
    type: CurrencyType.ORML,
    role: CurrencyRole.Wrappable,
    icon: React.createElement(EdgewareLogo),
    addresses: new Map(),
  },
  [WebbCurrencyId.TEDG]: {
    name: 'Edgeware testnet token',
    symbol: 'tEDG',
    color: '',
    id: WebbCurrencyId.TEDG,
    type: CurrencyType.ORML,
    role: CurrencyRole.Wrappable,
    icon: React.createElement(EdgewareLogo),
    addresses: new Map(),
  },
  [WebbCurrencyId.ETH]: {
    name: 'Ethereum',
    symbol: 'ETH',
    color: '',
    id: WebbCurrencyId.ETH,
    type: CurrencyType.NATIVE,
    role: CurrencyRole.Wrappable,
    icon: React.createElement(EtherLogo),
    addresses: new Map([
      [InternalChainId.Ropsten, zeroAddress],
      [InternalChainId.Rinkeby, zeroAddress],
      [InternalChainId.Goerli, zeroAddress],
      [InternalChainId.Kovan, zeroAddress],
      [InternalChainId.OptimismTestnet, zeroAddress],
      [InternalChainId.ArbitrumTestnet, zeroAddress],
      [InternalChainId.HermesLocalnet, zeroAddress],
      [InternalChainId.AthenaLocalnet, zeroAddress],
    ]),
  },
  [WebbCurrencyId.ONE]: {
    name: 'Harmony',
    symbol: 'ONE',
    color: '',
    id: WebbCurrencyId.ONE,
    type: CurrencyType.NATIVE,
    role: CurrencyRole.Wrappable,
    icon: React.createElement(HarmonyLogo),
    addresses: new Map([
      [InternalChainId.HarmonyMainnet0, zeroAddress],
      [InternalChainId.HarmonyTestnet0, zeroAddress],
      [InternalChainId.HarmonyTestnet1, zeroAddress],
    ]),
  },
  [WebbCurrencyId.WEBB]: {
    // IS THIS AN EVM CHAIN?
    name: 'WEBB',
    symbol: 'WEBB',
    color: '',
    id: WebbCurrencyId.WEBB,
    type: CurrencyType.ORML,
    role: CurrencyRole.Governable,
    icon: React.createElement(WEBBLogo),
    addresses: new Map([[InternalChainId.WebbDevelopment, ZERO]]),
  },
  [WebbCurrencyId.SDN]: {
    name: 'Shiden',
    symbol: 'SDN',
    color: '',
    id: WebbCurrencyId.SDN,
    type: CurrencyType.NATIVE,
    role: CurrencyRole.Wrappable,
    icon: React.createElement(ShidenLogo),
    addresses: new Map([[InternalChainId.Shiden, zeroAddress]]),
  },
  [WebbCurrencyId.WETH]: {
    name: 'Wrapped Ethereum',
    symbol: 'WETH',
    color: '',
    id: WebbCurrencyId.WETH,
    type: CurrencyType.ERC20,
    role: CurrencyRole.Wrappable,
    imageUrl: 'https://www.polysa.finance/images/farms/weth.png',
    icon: React.createElement(EtherLogo),
    addresses: new Map([
      [InternalChainId.Ropsten, '0xc778417E063141139Fce010982780140Aa0cD5Ab'],
      [InternalChainId.Rinkeby, '0xc778417E063141139Fce010982780140Aa0cD5Ab'],
      [InternalChainId.Goerli, '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'],
      [InternalChainId.Kovan, '0xd0A1E359811322d97991E03f863a0C30C2cF029C'],
      [InternalChainId.OptimismTestnet, '0xbC6F6b680bc61e30dB47721c6D1c5cde19C1300d'],
      [InternalChainId.ArbitrumTestnet, '0xEBbc3452Cc911591e4F18f3b36727Df45d6bd1f9'],
      [InternalChainId.PolygonTestnet, '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889'],
    ]),
  },
  [WebbCurrencyId.MATIC]: {
    name: 'Polygon',
    symbol: 'MATIC',
    color: '',
    id: WebbCurrencyId.MATIC,
    type: CurrencyType.NATIVE,
    role: CurrencyRole.Wrappable,
    icon: React.createElement(PolygonLogo),
    addresses: new Map([[InternalChainId.PolygonTestnet, zeroAddress]]),
  },
  [WebbCurrencyId.webbWETH]: {
    name: 'webbETH-test-1',
    symbol: 'webbWETH',
    color: '',
    id: WebbCurrencyId.webbWETH,
    type: CurrencyType.ERC20,
    role: CurrencyRole.Governable,
    icon: WebbWrappedLogo(EtherLogo()),
    addresses: new Map([
      [InternalChainId.Ropsten, '0x105779076d17FAe5EAADF010CA677475549F49E4'],
      [InternalChainId.Rinkeby, '0x4e7D4BEe028655F2865d9D147cF7B609c516d39C'],
      [InternalChainId.Goerli, '0x5257c558c246311552A824c491285667B3a445a2'],
      [InternalChainId.PolygonTestnet, '0x50A7b748F3C50F808a289cA041E48834A41A6d95'],
      [InternalChainId.OptimismTestnet, '0xEAF873F1F6c91fEf73d4839b5fC7954554BBE518'],
      [InternalChainId.ArbitrumTestnet, '0xD6F1E78B5F1Ebf8fF5a60C9d52eabFa73E5c5220'],
    ]),
  },
  [WebbCurrencyId.DEV]: {
    name: 'Development Token',
    symbol: 'DEV',
    color: '',
    id: WebbCurrencyId.DEV,
    type: CurrencyType.ERC20,
    role: CurrencyRole.Wrappable,
    icon: React.createElement(EtherLogo),
    addresses: new Map([
      [InternalChainId.HermesLocalnet, '0x2946259E0334f33A064106302415aD3391BeD384'],
      [InternalChainId.AthenaLocalnet, '0xF2E246BB76DF876Cef8b38ae84130F4F55De395b'],
    ]),
  },
  [WebbCurrencyId.webbDEV]: {
    name: 'Webb Development Token',
    symbol: 'webbDEV',
    color: '',
    id: WebbCurrencyId.webbDEV,
    type: CurrencyType.ERC20,
    role: CurrencyRole.Governable,
    icon: WebbWrappedLogo(EtherLogo()),
    addresses: new Map([
      [InternalChainId.HermesLocalnet, '0xD24260C102B5D128cbEFA0F655E5be3c2370677C'],
      [InternalChainId.AthenaLocalnet, '0xD30C8839c1145609E564b986F667b273Ddcb8496'],
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
