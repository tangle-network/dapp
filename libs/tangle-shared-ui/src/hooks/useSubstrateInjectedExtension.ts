import { InjectedExtension } from '@polkadot/extension-inject/types';
import { useActiveAccount } from '@webb-tools/api-provider-environment/hooks/useActiveAccount';
import { useCallback } from 'react';
import { findInjectorForAddress } from '../utils/polkadot/api';
import usePromise from './usePromise';

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
