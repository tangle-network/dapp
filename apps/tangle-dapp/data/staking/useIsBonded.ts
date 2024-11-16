import useApiRx from '@webb-tools/tangle-shared-ui/hooks/useApiRx';
import { useCallback } from 'react';

import useSubstrateAddress from '../../hooks/useSubstrateAddress';

const useIsBonded = () => {
  const activeSubstrateAddress = useSubstrateAddress();

  const { result: bondedInfo, ...other } = useApiRx(
    useCallback(
      (api) => {
        if (activeSubstrateAddress === null) {
          return null;
        }

        return api.query.staking.bonded(activeSubstrateAddress);
      },
      [activeSubstrateAddress],
    ),
  );

  return { isBonded: bondedInfo === null ? null : bondedInfo.isSome, ...other };
};

export default useIsBonded;
