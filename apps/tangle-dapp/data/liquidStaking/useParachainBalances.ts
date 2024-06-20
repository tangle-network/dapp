'use client';

// This will override global types and provide type definitions for
// the Tangle Restaking Parachain's pallets and extrinsics.
import '@webb-tools/tangle-restaking-types';

import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { useCallback } from 'react';

import useApiRx from '../../hooks/useApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';

const useParachainBalances = () => {
  const activeSubstrateAddress = useSubstrateAddress();

  return useApiRx(
    useCallback(
      (api) => {
        if (activeSubstrateAddress === null) {
          return null;
        }

        const result =
          // TODO: For some reason, the `api.query.tokens.accounts` method does not recognize passing in `null` for the token parameter, which is equivalent to passing `None` and should return the balance for all tokens. For now, manually casting the return type.
          api.query.tokens.accounts.entries(activeSubstrateAddress);

        return result;
      },
      [activeSubstrateAddress],
    ),
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );
};

export default useParachainBalances;
