import { InjectedExtension } from '@polkadot/extension-inject/types';
import { useWebContext } from '@tangle-network/api-provider-environment';
import { PolkadotProvider } from '@tangle-network/polkadot-api-provider';

const useSubstrateInjectedExtension = (): InjectedExtension | null => {
  const { activeApi } = useWebContext();

  return activeApi instanceof PolkadotProvider
    ? activeApi.injectedExtension
    : null;
};

export default useSubstrateInjectedExtension;
