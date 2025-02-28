import { InjectedExtension } from '@polkadot/extension-inject/types';
import { useWebContext } from '@tangle-network/api-provider-environment';
import { WebbPolkadot } from '@tangle-network/polkadot-api-provider';

const useSubstrateInjectedExtension = (): InjectedExtension | null => {
  const { activeApi } = useWebContext();

  return activeApi instanceof WebbPolkadot ? activeApi.injectedExtension : null;
};

export default useSubstrateInjectedExtension;
