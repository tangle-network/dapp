import {
  CurrencyId,
  CurrencyRole,
  CurrencyType,
  PresetTypedChainId,
  zeroAddress,
} from '@webb-tools/dapp-types';
import GanacheLogo from '@webb-tools/logos/chains/GanacheLogo';
import HarmonyLogo from '@webb-tools/logos/chains/HarmonyLogo';
import { MoonbeamLogo } from '@webb-tools/logos/chains/MoonbeamLogo';
import PolygonLogo from '@webb-tools/logos/chains/PolygonLogo';
import ShidenLogo from '@webb-tools/logos/chains/ShidenLogo';
import WEBBLogo from '@webb-tools/logos/chains/WebbLogo';
import EtherLogo from '@webb-tools/logos/Eth';
import WebbWrappedLogo from '@webb-tools/logos/WebbWrappedLogo';
import React from 'react';

import { CurrencyConfig } from './currency-config.interface';

export const currenciesConfig: Record<number, CurrencyConfig> = {
  [CurrencyId.ETH]: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    color: '',
    id: CurrencyId.ETH,
    type: CurrencyType.NATIVE,
    role: CurrencyRole.Wrappable,
    icon: EtherLogo,
    addresses: new Map([
      [PresetTypedChainId.Ropsten, zeroAddress],
      [PresetTypedChainId.Rinkeby, zeroAddress],
      [PresetTypedChainId.Goerli, zeroAddress],
      [PresetTypedChainId.Kovan, zeroAddress],
      [PresetTypedChainId.OptimismTestnet, zeroAddress],
      [PresetTypedChainId.ArbitrumTestnet, zeroAddress],
      [PresetTypedChainId.HermesLocalnet, zeroAddress],
      [PresetTypedChainId.AthenaLocalnet, zeroAddress],
      [PresetTypedChainId.DemeterLocalnet, zeroAddress],
    ]),
  },
  [CurrencyId.ONE]: {
    name: 'Harmony',
    symbol: 'ONE',
    decimals: 18,
    color: '',
    id: CurrencyId.ONE,
    type: CurrencyType.NATIVE,
    role: CurrencyRole.Wrappable,
    icon: HarmonyLogo,
    addresses: new Map([
      [PresetTypedChainId.HarmonyMainnet0, zeroAddress],
      [PresetTypedChainId.HarmonyTestnet0, zeroAddress],
      [PresetTypedChainId.HarmonyTestnet1, zeroAddress],
    ]),
  },
  // This currency represents the native currency
  // of a protocol-substrate local chain.
  [CurrencyId.WEBB]: {
    name: 'WEBB',
    symbol: 'WEBB',
    decimals: 12,
    color: '',
    id: CurrencyId.WEBB,
    type: CurrencyType.NATIVE,
    role: CurrencyRole.Wrappable,
    icon: WEBBLogo,
    addresses: new Map([
      [PresetTypedChainId.LocalTangleStandalone, '0'],
      [PresetTypedChainId.DkgSubstrateStandalone, '0'],
      [PresetTypedChainId.ProtocolSubstrateStandalone, '0'],
    ]),
  },
  [CurrencyId.WEBBSQR]: {
    name: 'WEBB^2',
    symbol: 'WEBB^2',
    decimals: 12,
    color: '',
    id: CurrencyId.WEBBSQR,
    type: CurrencyType.NATIVE,
    role: CurrencyRole.Governable,
    icon: WEBBLogo,
    addresses: new Map([
      [PresetTypedChainId.LocalTangleStandalone, '2'],
      [PresetTypedChainId.DkgSubstrateStandalone, '2'],
      [PresetTypedChainId.ProtocolSubstrateStandalone, '2'],
    ]),
  },
  [CurrencyId.SDN]: {
    name: 'Shiden',
    symbol: 'SDN',
    decimals: 18,
    color: '',
    id: CurrencyId.SDN,
    type: CurrencyType.NATIVE,
    role: CurrencyRole.Wrappable,
    icon: ShidenLogo,
    addresses: new Map([[PresetTypedChainId.Shiden, zeroAddress]]),
  },
  [CurrencyId.WETH]: {
    name: 'Wrapped Ethereum',
    symbol: 'WETH',
    decimals: 18,
    color: '',
    id: CurrencyId.WETH,
    type: CurrencyType.ERC20,
    role: CurrencyRole.Wrappable,
    imageUrl: 'https://www.polysa.finance/images/farms/weth.png',
    icon: EtherLogo,
    addresses: new Map([
      [
        PresetTypedChainId.Ropsten,
        '0xc778417E063141139Fce010982780140Aa0cD5Ab',
      ],
      [
        PresetTypedChainId.Rinkeby,
        '0xc778417E063141139Fce010982780140Aa0cD5Ab',
      ],
      [PresetTypedChainId.Goerli, '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'],
      [PresetTypedChainId.Sepolia, '0xeD43f81C17976372Fcb5786Dd214572e7dbB92c7'],
      [PresetTypedChainId.Kovan, '0xd0A1E359811322d97991E03f863a0C30C2cF029C'],
      [
        PresetTypedChainId.OptimismTestnet,
        '0x4200000000000000000000000000000000000006',
      ],
      [
        PresetTypedChainId.ArbitrumTestnet,
        '0xe39Ab88f8A4777030A534146A9Ca3B52bd5D43A3',
      ],
      [
        PresetTypedChainId.PolygonTestnet,
        '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
      ],
      [
        PresetTypedChainId.MoonbaseAlpha,
        '0xD909178CC99d318e4D46e7E66a972955859670E1',
      ],
    ]),
  },
  [CurrencyId.MATIC]: {
    name: 'Polygon',
    symbol: 'MATIC',
    decimals: 18,
    color: '',
    id: CurrencyId.MATIC,
    type: CurrencyType.NATIVE,
    role: CurrencyRole.Wrappable,
    icon: PolygonLogo,
    addresses: new Map([[PresetTypedChainId.PolygonTestnet, zeroAddress]]),
  },
  [CurrencyId.webbETH]: {
    name: 'webbETH',
    symbol: 'webbETH',
    decimals: 18,
    color: '',
    id: CurrencyId.webbETH,
    type: CurrencyType.ERC20,
    role: CurrencyRole.Governable,
    icon: () => WebbWrappedLogo(EtherLogo()),
    addresses: new Map([
      [PresetTypedChainId.Goerli, '0x35295fbb71273b84f66e70b8e341d408150dcaf9'],
      [PresetTypedChainId.Sepolia, '0xeda366e62551d4b1aad35018e0150203897f0bd6'],
      [
        PresetTypedChainId.PolygonTestnet,
        '0x8b35babc6b37a2f98c85a6734c040bc996595d1c',
      ],
      [
        PresetTypedChainId.OptimismTestnet,
        '0x6188f18359250f241e2171bafd57447f8931176e',
      ],
      [
        PresetTypedChainId.ArbitrumTestnet,
        '0x1078abf568ddb63fb3c03cec849415a6ff8833f2',
      ],
      [
        PresetTypedChainId.MoonbaseAlpha,
        '0x0a1980666b39751fa01f6ae99f3bd90f0868f79d',
      ],
    ]),
  },
  [CurrencyId.DEV]: {
    name: 'Development Token',
    symbol: 'DEV',
    decimals: 18,
    color: '',
    id: CurrencyId.DEV,
    type: CurrencyType.ERC20,
    role: CurrencyRole.Wrappable,
    icon: GanacheLogo,
    addresses: new Map([
      [
        PresetTypedChainId.HermesLocalnet,
        '0x2946259E0334f33A064106302415aD3391BeD384',
      ],
      [
        PresetTypedChainId.AthenaLocalnet,
        '0xDe09E74d4888Bc4e65F589e8c13Bce9F71DdF4c7',
      ],
      [
        PresetTypedChainId.DemeterLocalnet,
        '0xF2E246BB76DF876Cef8b38ae84130F4F55De395b',
      ],
    ]),
  },
  [CurrencyId.webbDEV]: {
    name: 'Webb Development Token',
    symbol: 'webbDEV',
    decimals: 18,
    color: '',
    id: CurrencyId.webbDEV,
    type: CurrencyType.ERC20,
    role: CurrencyRole.Governable,
    icon: () => WebbWrappedLogo(GanacheLogo()),
    addresses: new Map([
      [
        PresetTypedChainId.HermesLocalnet,
        '0xcbD945E77ADB65651F503723aC322591f3435cC5',
      ],
      [
        PresetTypedChainId.AthenaLocalnet,
        '0x4e3df2073bf4b43B9944b8e5A463b1E185D6448C',
      ],
      [
        PresetTypedChainId.DemeterLocalnet,
        '0x510C6297cC30A058F41eb4AF1BFC9953EaD8b577',
      ],
    ]),
  },
  [CurrencyId.TEST]: {
    name: 'Test Token',
    symbol: 'TEST',
    decimals: 18,
    color: '',
    id: CurrencyId.TEST,
    type: CurrencyType.ORML,
    role: CurrencyRole.Wrappable,
    icon: GanacheLogo,
    addresses: new Map([[PresetTypedChainId.ProtocolSubstrateStandalone, '1']]),
  },
  [CurrencyId.KSM]: {
    name: 'Kusama',
    symbol: 'KSM',
    decimals: 12,
    color: '',
    id: CurrencyId.KSM,
    type: CurrencyType.NATIVE,
    role: CurrencyRole.Wrappable,
    icon: WEBBLogo,
    addresses: new Map([[PresetTypedChainId.Kusama, '0']]),
  },
  [CurrencyId.DOT]: {
    name: 'Polkadot',
    symbol: 'DOT',
    decimals: 10,
    color: '',
    id: CurrencyId.DOT,
    type: CurrencyType.NATIVE,
    role: CurrencyRole.Wrappable,
    icon: WEBBLogo,
    addresses: new Map([[PresetTypedChainId.Polkadot, '0']]),
  },
  [CurrencyId.moonDEV]: {
    name: 'moonbase Dev',
    symbol: 'moonDEV',
    decimals: 12,
    color: '',
    id: CurrencyId.moonDEV,
    type: CurrencyType.NATIVE,
    role: CurrencyRole.Wrappable,
    icon: MoonbeamLogo,
    addresses: new Map([[PresetTypedChainId.MoonbaseAlpha, '0']]),
  },
};
