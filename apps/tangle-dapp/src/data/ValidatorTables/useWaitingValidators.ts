import { DEFAULT_FLAGS_WAITING } from '@tangle-network/dapp-config';
import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import { useCallback } from 'react';
import { map } from 'rxjs';

import { useValidators } from './useValidators';

const useWaitingValidators = () => {
  const {
    result: waitingValidatorAddresses,
    isLoading: isLoadingWaitingValidatorAddresses,
  } = useApiRx(
    useCallback(
      (api) =>
        api.derive.staking
          .waitingInfo(DEFAULT_FLAGS_WAITING)
          .pipe(map((derive) => derive.waiting)),
      [],
    ),
  );

  return useValidators(
    waitingValidatorAddresses,
    isLoadingWaitingValidatorAddresses,
    false,
  );
};

export default useWaitingValidators;
