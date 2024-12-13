import { InjectedExtension } from '@polkadot/extension-inject/types';
import { useActiveAccount } from '@webb-tools/api-provider-environment/hooks/useActiveAccount';
import usePromise from '@webb-tools/tangle-shared-ui/hooks/usePromise';
import { findInjectorForAddress } from '@webb-tools/tangle-shared-ui/utils/polkadot/api';
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
