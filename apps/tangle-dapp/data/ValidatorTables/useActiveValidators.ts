import { useCallback } from 'react';

import useApiRx from '../../hooks/useApiRx';
import { useValidators } from './useValidators';

const useActiveValidators = () => {
  const { result: activeValidatorAddresses } = useApiRx(
    useCallback((api) => api.query.session.validators(), [])
  );

  return useValidators(activeValidatorAddresses, true);
};

export default useActiveValidators;
