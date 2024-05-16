import { DEFAULT_FLAGS_WAITING } from '@webb-tools/dapp-config';
import { useCallback } from 'react';
import { map } from 'rxjs';

import useApiRx from '../../hooks/useApiRx';
import { useValidators } from './useValidators';

const useWaitingValidators = () => {
  const { result: waitingValidatorAddresses } = useApiRx(
    useCallback(
      (api) =>
        api.derive.staking
          .waitingInfo(DEFAULT_FLAGS_WAITING)
          .pipe(map((derive) => derive.waiting)),
      []
    )
  );

  return useValidators(waitingValidatorAddresses, false);
};

export default useWaitingValidators;
