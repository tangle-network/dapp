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
        if (!activeSubstrateAddress) {
          return null;
        }

        return api.query.staking.nominators(activeSubstrateAddress);
      },
      [activeSubstrateAddress]
    )
  );

  const {
    data: bondedInfo,
    isLoading: isLoadingBondedInfo,
    error: bondedInfoError,
  } = usePolkadotApiRx(
    useCallback(
      (api) => {
        if (!activeSubstrateAddress) {
          return null;
        }

        return api.query.staking.bonded(activeSubstrateAddress);
      },
      [activeSubstrateAddress]
    )
  );

  useErrorReporting(
    'Failed to determine whether the account is a first time nominator',
    nominatorsError,
    bondedInfoError
  );

  const isFirstTimeNominator = (() => {
    if (bondedInfo === null || nominators === null) {
      return null;
    }

    const hasNominatedValidators = nominators.isSome;
    const isAlreadyBonded = bondedInfo.isSome;

    return !isAlreadyBonded && !hasNominatedValidators;
  })();

  return {
    isFirstTimeNominator,
    isLoading: isLoadingBondedInfo || isLoadingNominators,
    isError: nominatorsError !== null || bondedInfoError !== null,
  };
};

export default useIsFirstTimeNominator;
