import { useCallback } from 'react';
import { map, of } from 'rxjs';

import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';

const useRestakingTotalRewards = () =>
  usePolkadotApiRx(
    useCallback((apiRx, substrateAccount) => {
      if (!substrateAccount) return of(null);

      if (!apiRx.query.jobs.validatorRewards) return of(null);

      return apiRx.query.jobs.validatorRewards(substrateAccount).pipe(
        map((reward) => {
          if (reward.isNone) {
            return null;
          }

          return reward.unwrap().toBn();
        })
      );
    }, [])
  );

export default useRestakingTotalRewards;
