import { useCallback } from 'react';
import { map } from 'rxjs';

import useApiRx from '../../hooks/useApiRx';
import { useValidators } from './useValidators';

const useWaitingValidators = () => {
  const { result: waitingValidatorAddresses } = useApiRx(
    useCallback(
      (api) =>
        api.derive.staking.waitingInfo().pipe(map((info) => info.waiting)),
      []
    )
  );

  return useValidators(waitingValidatorAddresses, 'Waiting');
};

export default useWaitingValidators;
