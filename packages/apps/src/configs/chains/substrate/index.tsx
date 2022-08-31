import { AppConfig, CurrencyId, PresetTypedChainId, SubstrateChainId } from '@webb-dapp/api-providers';
import KSMLogo from '@webb-dapp/apps/configs/logos/chains/KusamaLogo';
import DOTLogo from '@webb-dapp/apps/configs/logos/chains/PolkadotLogo';
import WEBBLogo from '@webb-dapp/apps/configs/logos/chains/WebbLogo';
import { TokenIcon } from '@webb-dapp/webb-ui-components/icons';
import { ChainType } from '@webb-tools/sdk-core';
import React from 'react';

export const getSupportedCurrenciesOfChain = (typedChainId: number): CurrencyId[] => {
  return chainsConfig[typedChainId].currencies;
};

export const chainsConfig: AppConfig['chains'] = {
  [PresetTypedChainId.ProtocolSubstrateStandalone]: {
    chainType: ChainType.Substrate,
    group: 'webb',
    tag: 'dev',
    chainId: SubstrateChainId.ProtocolSubstrateStandalone,
    logo: () => <TokenIcon name='webb' size='xl' />,
    url: 'ws://127.0.0.1:9944',
    name: 'Substrate',
    currencies: [CurrencyId.WEBB, CurrencyId.TEST],
    nativeCurrencyId: CurrencyId.WEBB,
  },
  [PresetTypedChainId.LocalTangleStandalone]: {
    chainType: ChainType.Substrate,
    group: 'webb',
    tag: 'dev',
    chainId: SubstrateChainId.LocalTangleStandalone,
    logo: () => <TokenIcon name='webb' size='xl' />,
    url: 'ws://127.0.0.1:9944',
    name: 'Tangle',
    currencies: [CurrencyId.WEBB],
    nativeCurrencyId: CurrencyId.WEBB,
  },
  [PresetTypedChainId.Kusama]: {
    chainType: ChainType.Substrate,
    group: 'webb',
    tag: 'live',
    chainId: SubstrateChainId.Kusama,
    logo: () => <TokenIcon name='kms' size='xl' />,
    url: 'wss://kusama-rpc.polkadot.io',
    name: 'Kusama',
    currencies: [CurrencyId.KSM],
    nativeCurrencyId: CurrencyId.KSM,
  },
  [PresetTypedChainId.Polkadot]: {
    chainType: ChainType.Substrate,
    group: 'webb',
    tag: 'live',
    chainId: SubstrateChainId.Polkadot,
    logo: () => <TokenIcon name='dot' size='xl' />,
    url: 'wss://rpc.polkadot.io',
    name: 'Polkadot',
    currencies: [CurrencyId.DOT],
    nativeCurrencyId: CurrencyId.DOT,
  },
};
