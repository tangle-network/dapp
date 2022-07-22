import {
  AppConfig,
  CurrencyRole,
  CurrencyType,
  WebbCurrencyId,
  WebbTypedChainId,
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
      [WebbTypedChainId.Ropsten, zeroAddress],
      [WebbTypedChainId.Rinkeby, zeroAddress],
      [WebbTypedChainId.Goerli, zeroAddress],
      [WebbTypedChainId.Kovan, zeroAddress],
      [WebbTypedChainId.OptimismTestnet, zeroAddress],
      [WebbTypedChainId.ArbitrumTestnet, zeroAddress],
      [WebbTypedChainId.HermesLocalnet, zeroAddress],
      [WebbTypedChainId.AthenaLocalnet, zeroAddress],
      [WebbTypedChainId.DemeterLocalnet, zeroAddress],
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
      [WebbTypedChainId.HarmonyMainnet0, zeroAddress],
      [WebbTypedChainId.HarmonyTestnet0, zeroAddress],
      [WebbTypedChainId.HarmonyTestnet1, zeroAddress],
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
      [WebbTypedChainId.EggStandalone, '0'],
      [WebbTypedChainId.DkgSubstrateStandalone, '0'],
      [WebbTypedChainId.ProtocolSubstrateStandalone, '0'],
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
    addresses: new Map([[WebbTypedChainId.Shiden, zeroAddress]]),
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
      [WebbTypedChainId.Ropsten, '0xc778417E063141139Fce010982780140Aa0cD5Ab'],
      [WebbTypedChainId.Rinkeby, '0xc778417E063141139Fce010982780140Aa0cD5Ab'],
      [WebbTypedChainId.Goerli, '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'],
      [WebbTypedChainId.Kovan, '0xd0A1E359811322d97991E03f863a0C30C2cF029C'],
      [WebbTypedChainId.OptimismTestnet, '0xbC6F6b680bc61e30dB47721c6D1c5cde19C1300d'],
      [WebbTypedChainId.ArbitrumTestnet, '0xEBbc3452Cc911591e4F18f3b36727Df45d6bd1f9'],
      [WebbTypedChainId.PolygonTestnet, '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889'],
      [WebbTypedChainId.MoonbaseAlpha, '0xD909178CC99d318e4D46e7E66a972955859670E1'],
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
    addresses: new Map([[WebbTypedChainId.PolygonTestnet, zeroAddress]]),
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
      [WebbTypedChainId.Ropsten, '0x91aE682aaeFE8e3c5059b170570D6fa42435C141'],
      [WebbTypedChainId.Rinkeby, '0x4953110789D0cB6de126f4EA88890670ccfe6906'],
      [WebbTypedChainId.Goerli, '0x6447F077a6cD8dadB9D3daD9f6C4B5a06183b5d7'],
      [WebbTypedChainId.PolygonTestnet, '0x682FaA319Bf7baE7F0cb68435e857d22Bf976e17'],
      [WebbTypedChainId.OptimismTestnet, '0x9898b4968fDD84b3aB0E901296F54775bA2fa6b5'],
      [WebbTypedChainId.ArbitrumTestnet, '0x88b7cb281650e7b161640790515fafe362c255c6'],
      [WebbTypedChainId.Kovan, '0x91a9a1e76fa609F6ba8fCd718a60B030678765ad'],
      [WebbTypedChainId.MoonbaseAlpha, '0xb30b0bf0CD3a73F97679c962424d4EF8dfe8e13D'],
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
      [WebbTypedChainId.HermesLocalnet, '0x2946259E0334f33A064106302415aD3391BeD384'],
      [WebbTypedChainId.AthenaLocalnet, '0xDe09E74d4888Bc4e65F589e8c13Bce9F71DdF4c7'],
      [WebbTypedChainId.DemeterLocalnet, '0xF2E246BB76DF876Cef8b38ae84130F4F55De395b'],
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
      [WebbTypedChainId.HermesLocalnet, '0xD30C8839c1145609E564b986F667b273Ddcb8496'],
      [WebbTypedChainId.AthenaLocalnet, '0xD24260C102B5D128cbEFA0F655E5be3c2370677C'],
      [WebbTypedChainId.DemeterLocalnet, '0xe69a847CD5BC0C9480adA0b339d7F0a8caC2B667'],
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
    addresses: new Map([[WebbTypedChainId.ProtocolSubstrateStandalone, '1']]),
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
    addresses: new Map([[WebbTypedChainId.Kusama, '0']]),
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
    addresses: new Map([[WebbTypedChainId.Polkadot, '0']]),
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
    addresses: new Map([[WebbTypedChainId.MoonbaseAlpha, '0']]),
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
