import { InjectedExtension } from '@polkadot/extension-inject/types';
import { useCallback, useEffect } from 'react';
import { findInjectorForAddress } from '../utils/polkadot/api';
import useAgnosticAccountInfo from './useAgnosticAccountInfo';
import usePromise from './usePromise';

const useSubstrateInjectedExtension = (): InjectedExtension | null => {
  const { substrateAddress } = useAgnosticAccountInfo();

  const { result: injector, refresh } = usePromise<InjectedExtension | null>(
    useCallback(() => {
      if (substrateAddress === null) {
        return Promise.resolve(null);
      }

      return findInjectorForAddress(substrateAddress);
    }, [substrateAddress]),
    null,
  );

  // Re-fetch the injector when the active account changes.
  useEffect(() => {
    refresh();
  }, [substrateAddress, refresh]);

  return injector;
};

export default useSubstrateInjectedExtension;
