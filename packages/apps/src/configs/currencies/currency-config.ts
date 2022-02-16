import { ChainType, InternalChainId } from '@webb-dapp/apps/configs/chains';
import EdgewareLogo from '@webb-dapp/apps/configs/logos/EdgewareLogo';
import EtherLogo from '@webb-dapp/apps/configs/logos/Eth';
import HarmonyLogo from '@webb-dapp/apps/configs/logos/HarmonyLogo';
import PolygonLogo from '@webb-dapp/apps/configs/logos/PolygonLogo';
import ShidenLogo from '@webb-dapp/apps/configs/logos/ShidenLogo';
import WEBBLogo from '@webb-dapp/apps/configs/logos/WebbLogo';
import WebbWrappedLogo from '@webb-dapp/apps/configs/logos/WebbWrappedLogo';
import { zeroAddress } from '@webb-dapp/contracts/contracts';
import { AppConfig } from '@webb-dapp/react-environment';
import { CurrencyRole, CurrencyType } from '@webb-dapp/react-environment/types/currency-config.interface';
import React from 'react';

import { WebbCurrencyId } from './webb-currency-id.enum';

export const currenciesConfig: AppConfig['currencies'] = {
  [WebbCurrencyId.EDG]: {
    chainType: ChainType.EVM,
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
    chainType: ChainType.EVM,
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
    chainType: ChainType.EVM,
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
    ]),
  },
  [WebbCurrencyId.ONE]: {
    chainType: ChainType.EVM,
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
    chainType: ChainType.EVM,
    name: 'WEBB',
    symbol: 'WEBB',
    color: '',
    id: WebbCurrencyId.WEBB,
    type: CurrencyType.ORML,
    role: CurrencyRole.Wrappable,
    icon: React.createElement(WEBBLogo),
    addresses: new Map(),
  },
  [WebbCurrencyId.SDN]: {
    chainType: ChainType.KusamaParachain,
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
    chainType: ChainType.EVM,
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
    chainType: ChainType.EVM,
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
    chainType: ChainType.EVM,
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
