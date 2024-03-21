import { useCallback } from 'react';
import { map } from 'rxjs';

import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';

const useRestakingEarnings = (substrateAccount: string | null) => {
  usePolkadotApiRx(
    useCallback(
      (apiRx) => {
        if (!substrateAccount) return null;

        return apiRx.query.roles.erasRestakeRewardPoints
          .entries()
          .pipe(map((entries) => {}));
      },
      [substrateAccount]
    )
  );
};

export default useRestakingEarnings;
