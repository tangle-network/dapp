import { AppConfig, SubstrateChainId, WebbCurrencyId, WebbTypedChainId } from '@webb-dapp/api-providers';
import KSMLogo from '@webb-dapp/apps/configs/logos/chains/KusamaLogo';
import DOTLogo from '@webb-dapp/apps/configs/logos/chains/PolkadotLogo';
import WEBBLogo from '@webb-dapp/apps/configs/logos/chains/WebbLogo';
import { ChainType } from '@webb-tools/sdk-core';

export const getSupportedCurrenciesOfChain = (typedChainId: number): WebbCurrencyId[] => {
  return chainsConfig[typedChainId].currencies;
};

export const chainsConfig: AppConfig['chains'] = {
  [WebbTypedChainId.ProtocolSubstrateStandalone]: {
    chainType: ChainType.Substrate,
    group: 'webb',
    tag: 'dev',
    chainId: SubstrateChainId.ProtocolSubstrateStandalone,
    logo: WEBBLogo,
    url: 'ws://127.0.0.1:9944',
    name: 'Substrate',
    currencies: [WebbCurrencyId.WEBB, WebbCurrencyId.TEST],
    nativeCurrencyId: WebbCurrencyId.WEBB,
  },
  [WebbTypedChainId.EggStandalone]: {
    chainType: ChainType.Substrate,
    group: 'webb',
    tag: 'test',
    chainId: SubstrateChainId.EggStandalone,
    logo: WEBBLogo,
    url: 'wss://standalone.webb.tools',
    name: 'Eggnet',
    currencies: [WebbCurrencyId.WEBB],
    nativeCurrencyId: WebbCurrencyId.WEBB,
  },
  [WebbTypedChainId.Kusama]: {
    chainType: ChainType.Substrate,
    group: 'webb',
    tag: 'live',
    chainId: SubstrateChainId.Kusama,
    logo: KSMLogo,
    url: 'wss://kusama-rpc.polkadot.io',
    name: 'Kusama',
    currencies: [WebbCurrencyId.KSM],
    nativeCurrencyId: WebbCurrencyId.KSM,
  },
  [WebbTypedChainId.Polkadot]: {
    chainType: ChainType.Substrate,
    group: 'webb',
    tag: 'live',
    chainId: SubstrateChainId.Polkadot,
    logo: DOTLogo,
    url: 'wss://rpc.polkadot.io',
    name: 'Polkadot',
    currencies: [WebbCurrencyId.DOT],
    nativeCurrencyId: WebbCurrencyId.DOT,
  },
};
