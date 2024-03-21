import { useCallback } from 'react';

import usePolkadotApiRx from '../../hooks/usePolkadotApi';

const useValidatorsPrefs = () => {
  return usePolkadotApiRx(
    // Memoize factory to prevent infinite loops.
    useCallback(async (api) => {
      console.debug('Fetching validator prefs');
      const validatorPrefs = await api.query.staking.validators.entries();
      return validatorPrefs;
    }, [])
  );
};

export default useValidatorsPrefs;
