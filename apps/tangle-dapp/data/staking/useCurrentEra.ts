import { Option, u32 } from '@polkadot/types';
import { useCallback } from 'react';
import { map } from 'rxjs';

import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';

const useCurrentEra = <
  UseReturnRawType extends boolean,
  R = UseReturnRawType extends true ? Option<u32> : number | null
>(
  isRawType?: UseReturnRawType
): ReturnType<typeof usePolkadotApiRx<R>> => {
  return usePolkadotApiRx(
    useCallback(
      (api) =>
        // TODO: Should not map to `null` if the current era is not available, but rather leave it as `Option<u32>`, or use our `Optional<number>` type. This is because `null` is used as an indicator for loading state, so it would be confusing to know whether the current era is not available or if it's still loading.
        api.query.staking.currentEra().pipe(
          map((currentEra) =>
            isRawType
              ? (currentEra as R)
              : // It's safe to convert `u32` to JavaScript's Number.
              currentEra.isNone
              ? (null as R)
              : (currentEra.unwrap().toNumber() as R)
          )
        ),
      [isRawType]
    )
  );
};

export default useCurrentEra;
