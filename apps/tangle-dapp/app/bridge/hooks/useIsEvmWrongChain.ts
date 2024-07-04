'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';

import { useBridge } from '../../../context/BridgeContext';
import { isEVMChain } from '../../../utils/bridge';

export default function useIsEvmWrongChain() {
  const { activeChain } = useWebContext();
  const { selectedSourceChain } = useBridge();

  return (
    isEVMChain(selectedSourceChain) &&
    activeChain?.id !== selectedSourceChain.id
  );
}
