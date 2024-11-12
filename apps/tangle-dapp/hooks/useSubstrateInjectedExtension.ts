import { InjectedExtension } from '@polkadot/extension-inject/types';
import { findInjectorForAddress } from '@webb-tools/tangle-shared-ui/utils/polkadot/api';
import { useCallback } from 'react';

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
