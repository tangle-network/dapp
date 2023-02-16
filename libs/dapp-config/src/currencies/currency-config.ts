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
    addresses: new Map<number, string>([
      [PresetTypedChainId.Goerli, zeroAddress],
      [PresetTypedChainId.Sepolia, zeroAddress],
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
    addresses: new Map<number, string>([
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
    addresses: new Map<number, string>([
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
    addresses: new Map<number, string>([
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
    addresses: new Map<number, string>([
      [PresetTypedChainId.Goerli, '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'],
      [
        PresetTypedChainId.Sepolia,
        '0xeD43f81C17976372Fcb5786Dd214572e7dbB92c7',
      ],
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
    addresses: new Map<number, string>([
      [PresetTypedChainId.PolygonTestnet, zeroAddress],
    ]),
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
    addresses: new Map<number, string>([
      [PresetTypedChainId.Goerli, '0xd0ad5973371a4469755a418c2f93fbfbfbb02a9a'],
      [
        PresetTypedChainId.Sepolia,
        '0xd0ad5973371a4469755a418c2f93fbfbfbb02a9a',
      ],
      [
        PresetTypedChainId.PolygonTestnet,
        '0xd0ad5973371a4469755a418c2f93fbfbfbb02a9a',
      ],
      [
        PresetTypedChainId.OptimismTestnet,
        '0xd0ad5973371a4469755a418c2f93fbfbfbb02a9a',
      ],
      [
        PresetTypedChainId.MoonbaseAlpha,
        '0xd0ad5973371a4469755a418c2f93fbfbfbb02a9a',
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
    addresses: new Map<number, string>([
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
    addresses: new Map<number, string>([
      [
        PresetTypedChainId.HermesLocalnet,
        '0x4e3df2073bf4b43B9944b8e5A463b1E185D6448C',
      ],
      [
        PresetTypedChainId.AthenaLocalnet,
        '0xbfce6B877Ebff977bB6e80B24FbBb7bC4eBcA4df',
      ],
      [
        PresetTypedChainId.DemeterLocalnet,
        '0xcbD945E77ADB65651F503723aC322591f3435cC5',
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
    symbol: 'MDEV',
    decimals: 12,
    color: '',
    id: CurrencyId.moonDEV,
    type: CurrencyType.NATIVE,
    role: CurrencyRole.Wrappable,
    icon: MoonbeamLogo,
    addresses: new Map([[PresetTypedChainId.MoonbaseAlpha, '0']]),
  },
};
