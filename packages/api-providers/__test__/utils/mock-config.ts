// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0
import { ChainType } from '@webb-tools/sdk-core';

import {
  AppConfig,
  CurrencyId,
  CurrencyRole,
  CurrencyType,
  EVMChainId,
  PresetTypedChainId,
  SubstrateChainId,
  ZERO,
  zeroAddress,
} from '../../';

const anchorsConfig: AppConfig['anchors'] = {
  [CurrencyId.webbDEV]: [
    {
      anchorAddresses: {
        [PresetTypedChainId.HermesLocalnet]: '0xb824C5F99339C7E486a1b452B635886BE82bc8b7',
        [PresetTypedChainId.AthenaLocalnet]: '0xFEe587E68c470DAE8147B46bB39fF230A29D4769',
        [PresetTypedChainId.DemeterLocalnet]: '0xdB587ef6aaA16b5719CDd3AaB316F0E70473e9Be',
      },
      anchorTreeIds: {},
      type: 'variable',
    },
  ],
};
const chainsConfig: AppConfig['chains'] = {
  [PresetTypedChainId.ProtocolSubstrateStandalone]: {
    chainId: SubstrateChainId.ProtocolSubstrateStandalone,
    chainType: ChainType.Substrate,
    currencies: [CurrencyId.WEBB],
    group: 'webb',
    logo: undefined,
    name: 'Webb Development',
    nativeCurrencyId: CurrencyId.WEBB,
    tag: 'dev',
    url: 'ws://127.0.0.1:9944',
  },
  [PresetTypedChainId.HermesLocalnet]: {
    chainId: EVMChainId.HermesLocalnet,
    chainType: ChainType.EVM,
    currencies: [CurrencyId.webbDEV, CurrencyId.DEV, CurrencyId.ETH],
    evmRpcUrls: ['http://127.0.0.1:5001'],
    group: 'eth',
    logo: undefined,
    name: 'Hermes Localnet',
    nativeCurrencyId: CurrencyId.ETH,
    tag: 'dev',
    url: 'http://127.0.0.1:5001',
  },
  [PresetTypedChainId.AthenaLocalnet]: {
    chainId: EVMChainId.AthenaLocalnet,
    chainType: ChainType.EVM,
    currencies: [CurrencyId.webbDEV, CurrencyId.DEV, CurrencyId.ETH],
    evmRpcUrls: ['http://127.0.0.1:5002'],
    group: 'eth',
    logo: undefined,
    name: 'Athena Localnet',
    nativeCurrencyId: CurrencyId.ETH,
    tag: 'dev',
    url: 'http://127.0.0.1:5002',
  },
  [PresetTypedChainId.DemeterLocalnet]: {
    chainId: EVMChainId.DemeterLocalnet,
    chainType: ChainType.EVM,
    currencies: [CurrencyId.webbDEV, CurrencyId.DEV, CurrencyId.ETH],
    evmRpcUrls: ['http://127.0.0.1:5003'],
    group: 'eth',
    logo: undefined,
    name: 'Demeter Localnet',
    nativeCurrencyId: CurrencyId.ETH,
    tag: 'dev',
    url: 'http://127.0.0.1:5003',
  },
};
const bridgeConfigByAsset: AppConfig['bridgeByAsset'] = {
  [CurrencyId.WEBB]: {
    anchors: anchorsConfig[CurrencyId.WEBB],
    asset: CurrencyId.WEBB,
  },
  [CurrencyId.webbDEV]: {
    anchors: anchorsConfig[CurrencyId.webbDEV],
    asset: CurrencyId.webbDEV,
  },
};
const currenciesConfig: AppConfig['currencies'] = {
  [CurrencyId.WEBB]: {
    addresses: new Map([[PresetTypedChainId.ProtocolSubstrateStandalone, ZERO]]),
    decimals: 12,
    color: '',
    icon: undefined,
    id: CurrencyId.WEBB,
    name: 'WEBB',
    role: CurrencyRole.Governable,
    symbol: 'WEBB',
    type: CurrencyType.ORML,
  },
  [CurrencyId.DEV]: {
    decimals: 18,
    addresses: new Map([
      [PresetTypedChainId.HermesLocalnet, '0x2946259E0334f33A064106302415aD3391BeD384'],
      [PresetTypedChainId.AthenaLocalnet, '0xDe09E74d4888Bc4e65F589e8c13Bce9F71DdF4c7'],
      [PresetTypedChainId.DemeterLocalnet, '0xF2E246BB76DF876Cef8b38ae84130F4F55De395b'],
    ]),
    color: '',
    icon: undefined,
    id: CurrencyId.DEV,
    name: 'Development Token',
    role: CurrencyRole.Wrappable,
    symbol: 'DEV',
    type: CurrencyType.ERC20,
  },
  [CurrencyId.webbDEV]: {
    decimals: 18,
    addresses: new Map([
      [PresetTypedChainId.HermesLocalnet, '0x510C6297cC30A058F41eb4AF1BFC9953EaD8b577'],
      [PresetTypedChainId.AthenaLocalnet, '0xcbD945E77ADB65651F503723aC322591f3435cC5'],
      [PresetTypedChainId.DemeterLocalnet, '0x7758F98C1c487E5653795470eEab6C4698bE541b'],
    ]),
    color: '',
    icon: undefined,
    id: CurrencyId.webbDEV,
    name: 'Webb Development Token',
    role: CurrencyRole.Governable,
    symbol: 'webbDEV',
    type: CurrencyType.ERC20,
  },
  [CurrencyId.ETH]: {
    decimals: 18,
    addresses: new Map([
      [PresetTypedChainId.HermesLocalnet, zeroAddress],
      [PresetTypedChainId.AthenaLocalnet, zeroAddress],
      [PresetTypedChainId.DemeterLocalnet, zeroAddress],
    ]),
    color: '',
    icon: undefined,
    id: CurrencyId.ETH,
    name: 'Ethereum',
    role: CurrencyRole.Wrappable,
    symbol: 'ETH',
    type: CurrencyType.NATIVE,
  },
};

const walletsConfig: AppConfig['wallet'] = {};

export const mockAppConfig: AppConfig = {
  anchors: anchorsConfig,
  bridgeByAsset: bridgeConfigByAsset,
  chains: chainsConfig,
  currencies: currenciesConfig,
  wallet: walletsConfig,
};
