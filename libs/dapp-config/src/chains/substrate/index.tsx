import { PresetTypedChainId, SubstrateChainId } from '@webb-tools/dapp-types';
import KSMLogo from '@webb-tools/logos/chains/KusamaLogo';
import DOTLogo from '@webb-tools/logos/chains/PolkadotLogo';
import WEBBLogo from '@webb-tools/logos/chains/WebbLogo';
import { ChainType } from '@webb-tools/sdk-core';

import { ChainConfig } from '../chain-config.interface';

export const chainsConfig: Record<number, ChainConfig> = {
  [PresetTypedChainId.ProtocolSubstrateStandalone]: {
    chainType: ChainType.Substrate,
    group: 'webb',
    tag: 'dev',
    chainId: SubstrateChainId.ProtocolSubstrateStandalone,
    logo: WEBBLogo,
    url: 'ws://127.0.0.1:9944',
    name: 'Substrate',
  },
  [PresetTypedChainId.LocalTangleStandalone]: {
    chainType: ChainType.Substrate,
    group: 'webb',
    tag: 'dev',
    chainId: SubstrateChainId.LocalTangleStandalone,
    logo: WEBBLogo,
    url: 'wss://standalone.webb.tools',
    name: 'Tangle',
  },
  [PresetTypedChainId.Kusama]: {
    chainType: ChainType.KusamaRelayChain,
    group: 'webb',
    tag: 'live',
    chainId: SubstrateChainId.Kusama,
    logo: KSMLogo,
    url: 'wss://kusama-rpc.polkadot.io',
    name: 'Kusama',
  },
  [PresetTypedChainId.Polkadot]: {
    chainType: ChainType.PolkadotRelayChain,
    group: 'webb',
    tag: 'live',
    chainId: SubstrateChainId.Polkadot,
    logo: DOTLogo,
    url: 'wss://rpc.polkadot.io',
    name: 'Polkadot',
  },
};
