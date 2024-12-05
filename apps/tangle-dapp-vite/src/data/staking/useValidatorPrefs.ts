import useApiRx from '@webb-tools/tangle-shared-ui/hooks/useApiRx';
import { useCallback } from 'react';

import useEntryMap from '../../hooks/useEntryMap';

const useValidatorPrefs = () => {
  const { result: validatorPrefs, ...other } = useApiRx(
    useCallback((api) => api.query.staking.validators.entries(), []),
  );

  const prefMap = useEntryMap(
    validatorPrefs,
    useCallback((key) => key.args[0].toString(), []),
  );

  return { result: prefMap, ...other };
};

export default useValidatorPrefs;
