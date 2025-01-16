import useApiRx from '@webb-tools/tangle-shared-ui/hooks/useApiRx';
import { useCallback } from 'react';
import { map } from 'rxjs';

const useRestakeCurrentRound = () => {
  return useApiRx(
    useCallback((api) => {
      return api.query.multiAssetDelegation
        .currentRound()
        .pipe(map((round) => round.toNumber()));
    }, []),
  );
};

export default useRestakeCurrentRound;
