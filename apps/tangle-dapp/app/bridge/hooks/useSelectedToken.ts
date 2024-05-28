'use client';

import { useMemo } from 'react';

import { BRIDGE_SUPPORTED_TOKENS } from '../../../constants/bridge';
import { useBridge } from '../../../context/BridgeContext';

export default function useSelectedToken() {
  const { selectedTokenId } = useBridge();
  const selectedToken = useMemo(
    () => BRIDGE_SUPPORTED_TOKENS[selectedTokenId],
    [selectedTokenId]
  );

  return selectedToken;
}
