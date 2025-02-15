import { InjectedExtension } from '@polkadot/extension-inject/types';
import { useActiveAccount } from '@tangle-network/api-provider-environment/hooks/useActiveAccount';
import { useCallback, useEffect } from 'react';
import { findInjectorForAddress } from '../utils/polkadot/api';
import usePromise from './usePromise';

const useSubstrateInjectedExtension = (): InjectedExtension | null => {
  const [activeAccount] = useActiveAccount();

  const { result: injector, refresh } = usePromise<InjectedExtension | null>(
    useCallback(() => {
      if (activeAccount === null) {
        return Promise.resolve(null);
      }

      return findInjectorForAddress(activeAccount.address);
    }, [activeAccount]),
    null,
  );

  // Re-fetch the injector when the active account changes.
  useEffect(() => {
    refresh();
  }, [activeAccount, refresh]);

  return injector;
};

export default useSubstrateInjectedExtension;
