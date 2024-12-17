import useApiRx from '@webb-tools/tangle-shared-ui/hooks/useApiRx';
import useSubstrateAddress from '@webb-tools/tangle-shared-ui/hooks/useSubstrateAddress';
import { useCallback } from 'react';

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
