import { InjectedExtension } from '@polkadot/extension-inject/types';
import { useActiveAccount } from '@tangle-network/api-provider-environment/hooks/useActiveAccount';
import usePromise from '@tangle-network/tangle-shared-ui/hooks/usePromise';
import { findInjectorForAddress } from '@tangle-network/tangle-shared-ui/utils/polkadot/api';
import { useCallback } from 'react';

export default function useSubstrateInjectedExtension() {
  const [activeAccount] = useActiveAccount();

  const { result: injector } = usePromise<InjectedExtension | null>(
    useCallback(() => {
      if (activeAccount === null) {
        return Promise.resolve(null);
      }

      return findInjectorForAddress(activeAccount.address);
    }, [activeAccount]),
    null,
  );

  return injector;
}
