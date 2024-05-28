'use client';

import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import { useMemo } from 'react';

import { useBridge } from '../../../context/BridgeContext';

export default function useTypedChainId() {
  const { selectedSourceChain, selectedDestinationChain } = useBridge();

  const sourceTypedChainId = useMemo(
    () =>
      calculateTypedChainId(
        selectedSourceChain.chainType,
        selectedSourceChain.id
      ),
    [selectedSourceChain]
  );

  const destinationTypedChainId = useMemo(
    () =>
      calculateTypedChainId(
        selectedDestinationChain.chainType,
        selectedDestinationChain.id
      ),
    [selectedDestinationChain]
  );

  return { sourceTypedChainId, destinationTypedChainId };
}
