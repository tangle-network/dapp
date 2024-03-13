import { useCallback } from 'react';
import { map } from 'rxjs';

import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';

const useCurrentEra = () => {
  return usePolkadotApiRx(
    // Memoize factory to prevent infinite loops.
    useCallback(
      (api) =>
        api.query.staking
          .currentEra()
          .pipe(
            map((currentEra) =>
              currentEra.isNone ? null : currentEra.unwrap()
            )
          ),
      []
    )
  );
};

export default useCurrentEra;
