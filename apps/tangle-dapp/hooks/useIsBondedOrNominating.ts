import { useCallback } from 'react';

import useApiRx from './useApiRx';
import useSubstrateAddress from './useSubstrateAddress';

const useIsBondedOrNominating = () => {
  const activeSubstrateAddress = useSubstrateAddress();

  const {
    result: nominations,
    isLoading: isLoadingNominators,
    error: nominatorsError,
  } = useApiRx(
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

  const {
    result: bondedInfo,
    isLoading: isLoadingBondedInfo,
    error: bondedInfoError,
  } = useApiRx(
    useCallback(
      (api) => {
        if (activeSubstrateAddress === null) {
          return null;
        }

        return api.query.staking.bonded(activeSubstrateAddress);
      },
      [activeSubstrateAddress]
    )
  );

  const isBondedOrNominating = (() => {
    const hasNominatedValidators = nominations !== null && nominations.isSome;
    const isBonded = bondedInfo !== null && bondedInfo.isSome;

    return isBonded || hasNominatedValidators;
  })();

  return {
    isBondedOrNominating,
    isLoading: isLoadingBondedInfo || isLoadingNominators,
    isError: nominatorsError !== null || bondedInfoError !== null,
  };
};

export default useIsBondedOrNominating;
