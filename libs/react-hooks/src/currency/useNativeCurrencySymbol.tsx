import { useWebContext } from '@webb-tools/api-provider-environment';
import { useMemo } from 'react';

export const useNativeCurrencySymbol = () => {
  const { activeChain, apiConfig } = useWebContext();

  return useMemo(() => {
    if (!activeChain) {
      return '';
    }

    return apiConfig.getNativeCurrencySymbol(activeChain.id);
  }, [activeChain, apiConfig]);
};
