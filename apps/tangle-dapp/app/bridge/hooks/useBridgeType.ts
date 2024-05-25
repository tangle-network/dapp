'use client';

import { useBridge } from '../../../context/BridgeContext';
import { BridgeType } from '../../../types/bridge';
import { isEVMChain, isSubstrateChain } from '../../../utils/bridge';

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
