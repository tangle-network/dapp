import { InjectedExtension } from '@polkadot/extension-inject/types';
import { useCallback } from 'react';

import { findInjectorForAddress } from '../utils/polkadot';
import useActiveAccountAddress from './useActiveAccountAddress';
import usePromise from './usePromise';

export default function useSubstrateInjectedExtension() {
  const activeAccountAddress = useActiveAccountAddress();

  const { result: injector } = usePromise<InjectedExtension | null>(
    useCallback(() => {
      if (activeAccountAddress === null) {
        return Promise.resolve(null);
      }

      return findInjectorForAddress(activeAccountAddress);
    }, [activeAccountAddress]),
    null,
  );

  return injector;
}
