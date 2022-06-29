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
    decimals: 18,
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
  [WebbCurrencyId.webbWETH]: {
    name: 'webbWETH',
    symbol: 'webbWETH',
    decimals: 18,
    color: '',
    id: WebbCurrencyId.webbWETH,
    type: CurrencyType.ERC20,
    role: CurrencyRole.Governable,
    icon: WebbWrappedLogo(EtherLogo()),
    addresses: new Map([
      [InternalChainId.Ropsten, '0x020dFbBDd993707bB9F0B8eCC06898869d842357'],
      [InternalChainId.Rinkeby, '0xe76187266aDFcEcd7CACa83B8F76d7333a592E81'],
      [InternalChainId.Goerli, '0xF4cB4936E1Be3527776160f0658efA2343Fad0A6'],
      [InternalChainId.PolygonTestnet, '0xa2ffa63a69278C01f7Df9397ed6D9Dd864482b22'],
      [InternalChainId.OptimismTestnet, '0xEff8d11701582D82ED526cE8D8cADD9D16b83a16'],
      [InternalChainId.ArbitrumTestnet, '0x9898b4968fdd84b3ab0e901296f54775ba2fa6b5'],
      [InternalChainId.Kovan, '0xa11b4064934ef08E31b8Dd9731f773B5b1B66988'],
      [InternalChainId.MoonbaseAlpha, '0x4AF6BAb4C62f01b0df15730a35035F0157fF4935'],
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
      [InternalChainId.HermesLocalnet, '0xF2E246BB76DF876Cef8b38ae84130F4F55De395b'],
      [InternalChainId.AthenaLocalnet, '0xF2E246BB76DF876Cef8b38ae84130F4F55De395b'],
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
      [InternalChainId.HermesLocalnet, '0xd24260c102b5d128cbefa0f655e5be3c2370677c'],
      [InternalChainId.AthenaLocalnet, '0xd24260c102b5d128cbefa0f655e5be3c2370677c'],
      [InternalChainId.DemeterLocalnet, '0xd24260c102b5d128cbefa0f655e5be3c2370677c'],
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
