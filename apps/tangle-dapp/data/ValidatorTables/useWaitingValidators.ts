import { useCallback } from 'react';
import { map } from 'rxjs';

import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import { useValidators } from './useValidators';

const useWaitingValidators = () => {
  const { data: waitingValidatorAddresses } = usePolkadotApiRx(
    useCallback(
      (api) =>
        api.derive.staking.waitingInfo().pipe(map((info) => info.waiting)),
      []
    )
  );

  return useValidators(waitingValidatorAddresses, 'Waiting');
};

export default useWaitingValidators;
