import { useCallback } from 'react';

import useApiRx from './useApiRx';
import useSubstrateAddress from './useSubstrateAddress';

const useIsNominating = () => {
  const activeSubstrateAddress = useSubstrateAddress();

  const { result: nominations, ...other } = useApiRx(
    useCallback(
      (api) => {
        if (activeSubstrateAddress === null) {
          return null;
        }

        return api.query.staking.nominators(activeSubstrateAddress);
      },
      [activeSubstrateAddress]
    )
  );

  return {
    isNominating: nominations === null ? null : nominations.isSome,
    ...other,
  };
};

export default useIsNominating;
