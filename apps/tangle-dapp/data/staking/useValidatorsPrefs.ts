import { useCallback } from 'react';

import usePolkadotApiRx from '../../hooks/usePolkadotApi';

const useValidatorsPrefs = () => {
  return usePolkadotApiRx(
    // Memoize factory to prevent infinite loops.
    useCallback((api) => api.query.staking.validators.entries(), [])
  );
};

export default useValidatorsPrefs;
