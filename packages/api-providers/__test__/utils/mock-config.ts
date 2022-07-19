// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import {
  AppConfig,
  ChainType,
  CurrencyRole,
  CurrencyType,
  EVMChainId,
  InternalChainId,
  SubstrateChainId,
  WebbCurrencyId,
  ZERO,
  zeroAddress,
} from '../../';

const anchorsConfig: AppConfig['anchors'] = {
  [WebbCurrencyId.webbDEV]: [
    {
      anchorAddresses: {
        [InternalChainId.HermesLocalnet]: '0xb824C5F99339C7E486a1b452B635886BE82bc8b7',
        [InternalChainId.AthenaLocalnet]: '0xFEe587E68c470DAE8147B46bB39fF230A29D4769',
        [InternalChainId.DemeterLocalnet]: '0xdB587ef6aaA16b5719CDd3AaB316F0E70473e9Be',
      },
      anchorTreeIds: {},
      type: 'variable',
    },
  ],
};
const chainsConfig: AppConfig['chains'] = {
  [InternalChainId.ProtocolSubstrateStandalone]: {
    chainId: SubstrateChainId.ProtocolSubstrateStandalone,
    chainType: ChainType.Substrate,
    currencies: [WebbCurrencyId.WEBB],
    group: 'webb',
    id: InternalChainId.ProtocolSubstrateStandalone,
    logo: undefined,
    name: 'Webb Development',
    nativeCurrencyId: WebbCurrencyId.WEBB,
    tag: 'dev',
    url: 'ws://127.0.0.1:9944',
  },
  [InternalChainId.HermesLocalnet]: {
    chainId: EVMChainId.HermesLocalnet,
    chainType: ChainType.EVM,
    currencies: [WebbCurrencyId.webbDEV, WebbCurrencyId.DEV, WebbCurrencyId.ETH],
    evmRpcUrls: ['http://127.0.0.1:5001'],
    group: 'eth',
    id: InternalChainId.HermesLocalnet,
    logo: undefined,
    name: 'Hermes Localnet',
    nativeCurrencyId: WebbCurrencyId.ETH,
    tag: 'dev',
    url: 'http://127.0.0.1:5001',
  },
  [InternalChainId.AthenaLocalnet]: {
    chainId: EVMChainId.AthenaLocalnet,
    chainType: ChainType.EVM,
    currencies: [WebbCurrencyId.webbDEV, WebbCurrencyId.DEV, WebbCurrencyId.ETH],
    evmRpcUrls: ['http://127.0.0.1:5002'],
    group: 'eth',
    id: InternalChainId.AthenaLocalnet,
    logo: undefined,
    name: 'Athena Localnet',
    nativeCurrencyId: WebbCurrencyId.ETH,
    tag: 'dev',
    url: 'http://127.0.0.1:5002',
  },
  [InternalChainId.DemeterLocalnet]: {
    chainId: EVMChainId.DemeterLocalnet,
    chainType: ChainType.EVM,
    currencies: [WebbCurrencyId.webbDEV, WebbCurrencyId.DEV, WebbCurrencyId.ETH],
    evmRpcUrls: ['http://127.0.0.1:5003'],
    group: 'eth',
    id: InternalChainId.DemeterLocalnet,
    logo: undefined,
    name: 'Demeter Localnet',
    nativeCurrencyId: WebbCurrencyId.ETH,
    tag: 'dev',
    url: 'http://127.0.0.1:5003',
  },
};
const bridgeConfigByAsset: AppConfig['bridgeByAsset'] = {
  [WebbCurrencyId.WEBB]: {
    anchors: anchorsConfig[WebbCurrencyId.WEBB],
    asset: WebbCurrencyId.WEBB,
  },
  [WebbCurrencyId.webbDEV]: {
    anchors: anchorsConfig[WebbCurrencyId.webbDEV],
    asset: WebbCurrencyId.webbDEV,
  },
};
const currenciesConfig: AppConfig['currencies'] = {
  [WebbCurrencyId.WEBB]: {
    addresses: new Map([[InternalChainId.ProtocolSubstrateStandalone, ZERO]]),
    decimals: 12,
    color: '',
    icon: undefined,
    id: WebbCurrencyId.WEBB,
    name: 'WEBB',
    role: CurrencyRole.Governable,
    symbol: 'WEBB',
    type: CurrencyType.ORML,
  },
  [WebbCurrencyId.DEV]: {
    decimals: 18,
    addresses: new Map([
      [InternalChainId.HermesLocalnet, '0x2946259E0334f33A064106302415aD3391BeD384'],
      [InternalChainId.AthenaLocalnet, '0xDe09E74d4888Bc4e65F589e8c13Bce9F71DdF4c7'],
      [InternalChainId.DemeterLocalnet, '0xF2E246BB76DF876Cef8b38ae84130F4F55De395b'],
    ]),
    color: '',
    icon: undefined,
    id: WebbCurrencyId.DEV,
    name: 'Development Token',
    role: CurrencyRole.Wrappable,
    symbol: 'DEV',
    type: CurrencyType.ERC20,
  },
  [WebbCurrencyId.webbDEV]: {
    decimals: 18,
    addresses: new Map([
      [InternalChainId.HermesLocalnet, '0x510C6297cC30A058F41eb4AF1BFC9953EaD8b577'],
      [InternalChainId.AthenaLocalnet, '0xcbD945E77ADB65651F503723aC322591f3435cC5'],
      [InternalChainId.DemeterLocalnet, '0x7758F98C1c487E5653795470eEab6C4698bE541b'],
    ]),
    color: '',
    icon: undefined,
    id: WebbCurrencyId.webbDEV,
    name: 'Webb Development Token',
    role: CurrencyRole.Governable,
    symbol: 'webbDEV',
    type: CurrencyType.ERC20,
  },
  [WebbCurrencyId.ETH]: {
    decimals: 18,
    addresses: new Map([
      [InternalChainId.HermesLocalnet, zeroAddress],
      [InternalChainId.AthenaLocalnet, zeroAddress],
      [InternalChainId.DemeterLocalnet, zeroAddress],
    ]),
    color: '',
    icon: undefined,
    id: WebbCurrencyId.ETH,
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
