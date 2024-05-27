'use client';

import { ChainType } from '@webb-tools/sdk-core/typed-chain-id';

import { useBridge } from '../../../context/BridgeContext';
import { BridgeType } from '../../../types/bridge';

export default function useBridgeType() {
  const { selectedSourceChain, selectedDestinationChain } = useBridge();

  // EVM to EVM
  if (
    isEVMChain(selectedSourceChain.chainType) &&
    isEVMChain(selectedDestinationChain.chainType)
  ) {
    return BridgeType.SYGMA_EVM_TO_EVM;
  }

  // EVM to Substrate
  if (
    isEVMChain(selectedSourceChain.chainType) &&
    isSubstrateChain(selectedDestinationChain.chainType)
  ) {
    return BridgeType.SYGMA_EVM_TO_SUBSTRATE;
  }

  // Substrate to EVM
  if (
    isSubstrateChain(selectedSourceChain.chainType) &&
    isEVMChain(selectedDestinationChain.chainType)
  ) {
    return BridgeType.SYGMA_SUBSTRATE_TO_EVM;
  }

  // Substrate to Substrate
  if (
    isSubstrateChain(selectedSourceChain.chainType) &&
    isSubstrateChain(selectedDestinationChain.chainType)
  ) {
    return BridgeType.SYGMA_SUBSTRATE_TO_SUBSTRATE;
  }

  throw new Error('Unsupported bridge type');
}

function isSubstrateChain(chainType: ChainType) {
  return (
    chainType === ChainType.Substrate ||
    chainType === ChainType.SubstrateDevelopment ||
    chainType === ChainType.PolkadotRelayChain ||
    chainType === ChainType.KusamaRelayChain ||
    chainType === ChainType.PolkadotParachain ||
    chainType === ChainType.KusamaParachain
  );
}

function isEVMChain(chainType: ChainType) {
  return chainType === ChainType.EVM;
}
