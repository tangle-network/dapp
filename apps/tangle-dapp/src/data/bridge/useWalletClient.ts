import { useWebContext } from '@webb-tools/api-provider-environment';
import { WebbWeb3Provider } from '@webb-tools/web3-api-provider';
import { useMemo } from 'react';

const useWalletClient = () => {
  const { activeApi } = useWebContext();

  const walletClient = useMemo(() => {
    if (!activeApi || !(activeApi instanceof WebbWeb3Provider)) {
      return null;
    }

    const walletClient = activeApi.walletClient;
    return walletClient;
  }, [activeApi]);

  return walletClient;
};

export default useWalletClient;
