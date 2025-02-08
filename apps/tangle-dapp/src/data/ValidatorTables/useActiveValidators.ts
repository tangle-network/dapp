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
      const validators = api.query.session.validators();

      return validators.pipe(
        map((validators) => {
          const validatorAddresses = Array.from(validators || []);

          return validatorAddresses.length > 0 ? validatorAddresses : null;
        }),
      );
    }, []),
  );

  return useValidators(
    activeValidatorAddresses,
    isLoadingActiveValidatorAddresses,
    true,
  );
};

export default useActiveValidators;
