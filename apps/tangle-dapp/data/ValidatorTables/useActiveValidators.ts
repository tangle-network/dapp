import { useCallback } from 'react';

import useApiRx from '../../hooks/useApiRx';
import { useValidators } from './useValidators';

const useActiveValidators = () => {
  const { data: activeValidatorAddresses } = useApiRx(
    useCallback((api) => api.query.session.validators(), [])
  );

  return useValidators(activeValidatorAddresses, 'Active');
};

export default useActiveValidators;
