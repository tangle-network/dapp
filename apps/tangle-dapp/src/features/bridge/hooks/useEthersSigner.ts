import { useWebContext } from '@tangle-network/api-provider-environment';
import { WebbWeb3Provider } from '@tangle-network/web3-api-provider';
import { useMemo } from 'react';
import viemConnectorClientToEthersSigner from '../../../utils/viemConnectorClientToEthersSigner';

const useEthersSigner = () => {
  const { activeApi } = useWebContext();

  const ethersSigner = useMemo(() => {
    if (!activeApi || !(activeApi instanceof WebbWeb3Provider)) {
      return null;
    }

    const walletClient = activeApi.walletClient;
    const ethersSigner = viemConnectorClientToEthersSigner(walletClient);

    return ethersSigner;
  }, [activeApi]);

  return ethersSigner;
};

export default useEthersSigner;
