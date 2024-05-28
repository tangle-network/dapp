'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';

import useTypedChainId from './useTypedChainId';

export default function useIsWrongEvmNetwork() {
  const { activeWallet, activeChain } = useWebContext();
  const { sourceTypedChainId } = useTypedChainId();

  if (activeWallet?.platform === 'EVM' && activeChain) {
    if (
      sourceTypedChainId !==
      calculateTypedChainId(activeChain.chainType, activeChain.id)
    ) {
      return true;
    }
  }
  return false;
}
