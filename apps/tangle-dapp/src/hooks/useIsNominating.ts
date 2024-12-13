import useApiRx from '@webb-tools/tangle-shared-ui/hooks/useApiRx';
import useSubstrateAddress from '@webb-tools/tangle-shared-ui/hooks/useSubstrateAddress';
import { useCallback } from 'react';

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
      [activeSubstrateAddress],
    ),
  );

  return {
    isNominating: nominations === null ? null : nominations.isSome,
    ...other,
  };
};

export default useIsNominating;
