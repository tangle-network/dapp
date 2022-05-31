import { AppConfig, ChainType, InternalChainId, SubstrateChainId, WebbCurrencyId } from '@webb-dapp/api-providers';
import WEBBLogo from '@webb-dapp/apps/configs/logos/chains/WebbLogo';
// TODO: Add logo
import KSMLogo from '@webb-dapp/apps/configs/logos/chains/WebbLogo';
// TODO: Add logo
import DOTLogo from '@webb-dapp/apps/configs/logos/chains/WebbLogo';

export const getSupportedCurrenciesOfChain = (chainId: InternalChainId): WebbCurrencyId[] => {
  return chainsConfig[chainId].currencies;
};

export const chainsConfig: AppConfig['chains'] = {
  [InternalChainId.ProtocolSubstrateStandalone]: {
    chainType: ChainType.Substrate,
    id: InternalChainId.ProtocolSubstrateStandalone,
    group: 'webb',
    tag: 'dev',
    chainId: SubstrateChainId.ProtocolSubstrateStandalone,
    logo: WEBBLogo,
    url: 'ws://127.0.0.1:9944',
    name: 'Protocol Substrate Development',
    currencies: [WebbCurrencyId.WEBB, WebbCurrencyId.TEST],
    nativeCurrencyId: WebbCurrencyId.WEBB,
  },
  [InternalChainId.EggStandalone]: {
    chainType: ChainType.Substrate,
    id: InternalChainId.EggStandalone,
    group: 'webb',
    tag: 'test',
    chainId: SubstrateChainId.EggStandalone,
    logo: WEBBLogo,
    url: 'wss://standalone.webb.tools',
    name: 'Webb Eggnet',
    currencies: [WebbCurrencyId.WEBB],
    nativeCurrencyId: WebbCurrencyId.WEBB,
  },
  [InternalChainId.Kusama]: {
    chainType: ChainType.Substrate,
    id: InternalChainId.Kusama,
    group: 'webb',
    tag: 'live',
    chainId: SubstrateChainId.Kusama,
    logo: KSMLogo,
    url: 'wss://kusama-rpc.polkadot.io',
    name: 'Kusama Relay Chain',
    currencies: [WebbCurrencyId.KSM],
    nativeCurrencyId: WebbCurrencyId.KSM,
  },
  [InternalChainId.Polkadot]: {
    chainType: ChainType.Substrate,
    id: InternalChainId.Polkadot,
    group: 'webb',
    tag: 'live',
    chainId: SubstrateChainId.Polkadot,
    logo: DOTLogo,
    url: 'wss://rpc.polkadot.io',
    name: 'Polkadot Relay Chain',
    currencies: [WebbCurrencyId.DOT],
    nativeCurrencyId: WebbCurrencyId.DOT,
  },
};
