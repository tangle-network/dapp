import { ChainConfig } from '@webb-tools/dapp-config/chains/chain-config.interface';
import { ChainType } from '@webb-tools/sdk-core/typed-chain-id';

export function isSubstrateChain(chainConfig: ChainConfig) {
  return (
    chainConfig.chainType === ChainType.Substrate ||
    chainConfig.chainType === ChainType.SubstrateDevelopment ||
    chainConfig.chainType === ChainType.PolkadotRelayChain ||
    chainConfig.chainType === ChainType.KusamaRelayChain ||
    chainConfig.chainType === ChainType.PolkadotParachain ||
    chainConfig.chainType === ChainType.KusamaParachain
  );
}

export function isEVMChain(chainConfig: ChainConfig) {
  return chainConfig.chainType === ChainType.EVM;
}
