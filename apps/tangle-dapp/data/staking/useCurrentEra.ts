import { useCallback } from 'react';
import { map } from 'rxjs';

import useApiRx from '../../hooks/useApiRx';

const useCurrentEra = () => {
  return useApiRx(
    useCallback(
      (api) =>
        // TODO: Should not map to `null` if the current era is not available, but rather leave it as `Option<u32>`, or use our `Optional<number>` type. This is because `null` is used as an indicator for loading state, so it would be confusing to know whether the current era is not available or if it's still loading.
        api.query.staking.currentEra().pipe(
          map((currentEra) =>
            // It's safe to convert `u32` to JavaScript's Number.
            currentEra.isNone ? null : currentEra.unwrap().toNumber(),
          ),
        ),
      [],
    ),
  );
};

export default useCurrentEra;
