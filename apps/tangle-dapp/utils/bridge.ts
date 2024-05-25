import { ChainType } from '@webb-tools/sdk-core/typed-chain-id';

export function isSubstrateChain(chainType: ChainType) {
  return (
    chainType === ChainType.Substrate ||
    chainType === ChainType.SubstrateDevelopment ||
    chainType === ChainType.PolkadotRelayChain ||
    chainType === ChainType.KusamaRelayChain ||
    chainType === ChainType.PolkadotParachain ||
    chainType === ChainType.KusamaParachain
  );
}

export function isEVMChain(chainType: ChainType) {
  return chainType === ChainType.EVM;
}
