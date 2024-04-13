import { useCallback } from 'react';

import useApiRx from '../../hooks/useApiRx';

const useValidatorsPrefs = () => {
  return useApiRx(
    // Memoize factory to prevent infinite loops.
    useCallback((api) => api.query.staking.validators.entries(), [])
  );
};

export default useValidatorsPrefs;
