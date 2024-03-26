import { useCallback } from 'react';

import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import { useValidators } from './useValidators';

const useActiveValidators = () => {
  const { data: activeValidatorAddresses } = usePolkadotApiRx(
    useCallback((api) => api.query.session.validators(), [])
  );

  return useValidators(activeValidatorAddresses, 'Active');
};

export default useActiveValidators;
