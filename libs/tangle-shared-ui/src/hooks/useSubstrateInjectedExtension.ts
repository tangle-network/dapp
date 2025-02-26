import { InjectedExtension } from '@polkadot/extension-inject/types';
import { useWebContext } from '@tangle-network/api-provider-environment';
import { PolkadotProvider } from '@tangle-network/polkadot-api-provider';

const useSubstrateInjectedExtension = (): InjectedExtension | null => {
  const { activeApi } = useWebContext();

  if (activeApi instanceof PolkadotProvider) {
    return activeApi.injectedExtension;
  }

  return null;
};

export default useSubstrateInjectedExtension;
