import { DEFAULT_FLAGS_ELECTED } from '@webb-tools/dapp-config';
import useApiRx from '@webb-tools/tangle-shared-ui/hooks/useApiRx';
import { useCallback } from 'react';
import { map } from 'rxjs';

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
