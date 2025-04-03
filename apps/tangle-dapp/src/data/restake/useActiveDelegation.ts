import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import useSubstrateAddress from '@tangle-network/tangle-shared-ui/hooks/useSubstrateAddress';
import {
  TangleError,
  TangleErrorCode,
} from '@tangle-network/tangle-shared-ui/types/error';
import { useCallback } from 'react';
import { map } from 'rxjs';

const useActiveDelegation = () => {
  const activeSubstrateAddress = useSubstrateAddress();

  return useApiRx(
    useCallback(
      (apiRx) => {
        if (apiRx.query.multiAssetDelegation?.delegators === undefined) {
          return new TangleError(TangleErrorCode.FEATURE_NOT_SUPPORTED);
        }

        if (activeSubstrateAddress === null) {
          return new TangleError(TangleErrorCode.INVALID_PARAMS);
        }

        return apiRx.query.multiAssetDelegation
          .delegators(activeSubstrateAddress)
          .pipe(
            map((result) => {
              if (result.isNone) {
                return null;
              }

              return result.unwrap();
            }),
          );
      },
      [activeSubstrateAddress],
    ),
  );
};

export default useActiveDelegation;
