import {
  AppConfig,
  CurrencyRole,
  CurrencyType,
  InternalChainId,
  WebbCurrencyId,
  zeroAddress,
} from '@webb-dapp/api-providers';
import GanacheLogo from '@webb-dapp/apps/configs/logos/chains/GanacheLogo';
import HarmonyLogo from '@webb-dapp/apps/configs/logos/chains/HarmonyLogo';
import { MoonbeamLogo } from '@webb-dapp/apps/configs/logos/chains/MoonbeamLogo';
import PolygonLogo from '@webb-dapp/apps/configs/logos/chains/PolygonLogo';
import ShidenLogo from '@webb-dapp/apps/configs/logos/chains/ShidenLogo';
import WEBBLogo from '@webb-dapp/apps/configs/logos/chains/WebbLogo';
import EtherLogo from '@webb-dapp/apps/configs/logos/Eth';
import WebbWrappedLogo from '@webb-dapp/apps/configs/logos/WebbWrappedLogo';
import React from 'react';

export const currenciesConfig: AppConfig['currencies'] = {
  [WebbCurrencyId.ETH]: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
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
      [InternalChainId.DemeterLocalnet, zeroAddress],
    ]),
  },
  [WebbCurrencyId.ONE]: {
    name: 'Harmony',
    symbol: 'ONE',
    decimals: 18,
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
  // This currency represents the native currency
  // of a protocol-substrate local chain.
  [WebbCurrencyId.WEBB]: {
    name: 'WEBB',
    symbol: 'WEBB',
    decimals: 12,
    color: '',
    id: WebbCurrencyId.WEBB,
    type: CurrencyType.NATIVE,
    role: CurrencyRole.Wrappable,
    icon: React.createElement(WEBBLogo),
    addresses: new Map([
      [InternalChainId.EggStandalone, '0'],
      [InternalChainId.DkgSubstrateStandalone, '0'],
      [InternalChainId.ProtocolSubstrateStandalone, '0'],
    ]),
  },
  [WebbCurrencyId.SDN]: {
    name: 'Shiden',
    symbol: 'SDN',
    decimals: 18,
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
    decimals: 18,
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
      [InternalChainId.MoonbaseAlpha, '0xD909178CC99d318e4D46e7E66a972955859670E1'],
    ]),
  },
  [WebbCurrencyId.MATIC]: {
    name: 'Polygon',
    symbol: 'MATIC',
    decimals: 18,
    color: '',
    id: WebbCurrencyId.MATIC,
    type: CurrencyType.NATIVE,
    role: CurrencyRole.Wrappable,
    icon: React.createElement(PolygonLogo),
    addresses: new Map([[InternalChainId.PolygonTestnet, zeroAddress]]),
  },
  [WebbCurrencyId.webbETH]: {
    name: 'webbETH',
    symbol: 'webbETH',
    decimals: 18,
    color: '',
    id: WebbCurrencyId.webbETH,
    type: CurrencyType.ERC20,
    role: CurrencyRole.Governable,
    icon: WebbWrappedLogo(EtherLogo()),
    addresses: new Map([
      [InternalChainId.Ropsten, '0x91aE682aaeFE8e3c5059b170570D6fa42435C141'],
      [InternalChainId.Rinkeby, '0x4953110789D0cB6de126f4EA88890670ccfe6906'],
      [InternalChainId.Goerli, '0x6447F077a6cD8dadB9D3daD9f6C4B5a06183b5d7'],
      [InternalChainId.PolygonTestnet, '0x682FaA319Bf7baE7F0cb68435e857d22Bf976e17'],
      [InternalChainId.OptimismTestnet, '0x9898b4968fDD84b3aB0E901296F54775bA2fa6b5'],
      [InternalChainId.ArbitrumTestnet, '0x88b7cb281650e7b161640790515fafe362c255c6'],
      [InternalChainId.Kovan, '0x91a9a1e76fa609F6ba8fCd718a60B030678765ad'],
      [InternalChainId.MoonbaseAlpha, '0xb30b0bf0CD3a73F97679c962424d4EF8dfe8e13D'],
    ]),
  },
  [WebbCurrencyId.DEV]: {
    name: 'Development Token',
    symbol: 'DEV',
    decimals: 18,
    color: '',
    id: WebbCurrencyId.DEV,
    type: CurrencyType.ERC20,
    role: CurrencyRole.Wrappable,
    icon: React.createElement(GanacheLogo),
    addresses: new Map([
      [InternalChainId.HermesLocalnet, '0x2946259E0334f33A064106302415aD3391BeD384'],
      [InternalChainId.AthenaLocalnet, '0xDe09E74d4888Bc4e65F589e8c13Bce9F71DdF4c7'],
      [InternalChainId.DemeterLocalnet, '0xF2E246BB76DF876Cef8b38ae84130F4F55De395b'],
    ]),
  },
  [WebbCurrencyId.webbDEV]: {
    name: 'Webb Development Token',
    symbol: 'webbDEV',
    decimals: 18,
    color: '',
    id: WebbCurrencyId.webbDEV,
    type: CurrencyType.ERC20,
    role: CurrencyRole.Governable,
    icon: WebbWrappedLogo(GanacheLogo()),
    addresses: new Map([
      [InternalChainId.HermesLocalnet, '0x510C6297cC30A058F41eb4AF1BFC9953EaD8b577'],
      [InternalChainId.AthenaLocalnet, '0xcbD945E77ADB65651F503723aC322591f3435cC5'],
      [InternalChainId.DemeterLocalnet, '0x7758F98C1c487E5653795470eEab6C4698bE541b'],
    ]),
  },
  [WebbCurrencyId.TEST]: {
    name: 'Test Token',
    symbol: 'TEST',
    decimals: 18,
    color: '',
    id: WebbCurrencyId.TEST,
    type: CurrencyType.ORML,
    role: CurrencyRole.Governable,
    icon: React.createElement(GanacheLogo),
    addresses: new Map([[InternalChainId.ProtocolSubstrateStandalone, '1']]),
  },
  [WebbCurrencyId.KSM]: {
    name: 'Kusama',
    symbol: 'KSM',
    decimals: 12,
    color: '',
    id: WebbCurrencyId.KSM,
    type: CurrencyType.NATIVE,
    role: CurrencyRole.Wrappable,
    icon: React.createElement(WEBBLogo),
    addresses: new Map([[InternalChainId.Kusama, '0']]),
  },
  [WebbCurrencyId.DOT]: {
    name: 'Polkadot',
    symbol: 'DOT',
    decimals: 10,
    color: '',
    id: WebbCurrencyId.DOT,
    type: CurrencyType.NATIVE,
    role: CurrencyRole.Wrappable,
    icon: React.createElement(WEBBLogo),
    addresses: new Map([[InternalChainId.Polkadot, '0']]),
  },
  [WebbCurrencyId.moonDEV]: {
    name: 'moonbase Dev',
    symbol: 'moonDEV',
    decimals: 12,
    color: '',
    id: WebbCurrencyId.moonDEV,
    type: CurrencyType.NATIVE,
    role: CurrencyRole.Wrappable,
    icon: React.createElement(MoonbeamLogo),
    addresses: new Map([[InternalChainId.MoonbaseAlpha, '0']]),
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
