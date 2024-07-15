import { DEFAULT_FLAGS_ELECTED } from '@webb-tools/dapp-config';
import { useCallback } from 'react';
import { map } from 'rxjs';

import useApiRx from '../../hooks/useApiRx';
import { useValidators } from './useValidators';

const useActiveValidators = () => {
  const {
    result: activeValidatorAddresses,
    isLoading: isLoadingActiveValidatorAddresses,
  } = useApiRx(
    useCallback((api) => {
      const electedInfo = api.derive.staking.electedInfo(DEFAULT_FLAGS_ELECTED);

      return electedInfo.pipe(map((derive) => derive.nextElected));
    }, []),
  );

  return useValidators(
    activeValidatorAddresses,
    isLoadingActiveValidatorAddresses,
    true,
  );
};

export default useActiveValidators;
