import { useCallback } from 'react';
import { map } from 'rxjs';

import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';

const useCurrentEra = () => {
  return usePolkadotApiRx(
    // Memoize factory to prevent infinite loops.
    useCallback(
      (api) =>
        api.query.staking.currentEra().pipe(
          map((currentEra) =>
            // It's safe to convert `u32` to JavaScript's Number.
            currentEra.isNone ? null : currentEra.unwrap().toNumber()
          )
        ),
      []
    )
  );
};

export default useCurrentEra;
