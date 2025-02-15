import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import useSubstrateAddress from '@tangle-network/tangle-shared-ui/hooks/useSubstrateAddress';
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
