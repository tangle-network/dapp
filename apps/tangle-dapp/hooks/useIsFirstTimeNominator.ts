import { useCallback } from 'react';

import useErrorReporting from './useErrorReporting';
import usePolkadotApiRx from './usePolkadotApiRx';
import useSubstrateAddress from './useSubstrateAddress';

const useIsFirstTimeNominator = () => {
  const activeSubstrateAddress = useSubstrateAddress();

  const {
    data: nominators,
    isLoading: isLoadingNominators,
    error: nominatorsError,
  } = usePolkadotApiRx(
    useCallback(
      (api) => {
        if (!activeSubstrateAddress) return null;
        return api.query.staking.nominators(activeSubstrateAddress);
      },
      [activeSubstrateAddress]
    )
  );

  const hasNominatedValidators = (() => {
    if (nominators === null) {
      return null;
    }

    return nominators.isSome;
  })();

  const {
    data: bondedInfo,
    isLoading: isLoadingBondedInfo,
    error: bondedInfoError,
  } = usePolkadotApiRx(
    useCallback(
      (api) => {
        if (!activeSubstrateAddress) return null;
        return api.query.staking.bonded(activeSubstrateAddress);
      },
      [activeSubstrateAddress]
    )
  );

  useErrorReporting('Failed', nominatorsError, bondedInfoError);

  const isFirstTimeNominator = (() => {
    const isAlreadyBonded = bondedInfo?.isSome ?? false;

    if (isAlreadyBonded === null || hasNominatedValidators === null) {
      return null;
    }

    return !isAlreadyBonded && !hasNominatedValidators;
  })();

  return {
    isFirstTimeNominator,
    isLoading: isLoadingBondedInfo || isLoadingNominators,
    isError: nominatorsError !== null || bondedInfoError !== null,
  };
};

export default useIsFirstTimeNominator;
