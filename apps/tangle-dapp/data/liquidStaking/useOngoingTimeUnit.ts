import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { useCallback } from 'react';

import {
  LiquidStakingCurrency,
  LiquidStakingCurrencyKey,
} from '../../constants/liquidStaking';
import useApiRx from '../../hooks/useApiRx';

// TODO: Consider changing this to `useOngoingTimeUnits` and return two maps: native and lst. That will increase the flexibility of the hook and allow for more use cases. Also, this can likely be used to calculate estimate unstaking times.
const useOngoingTimeUnit = (
  currency: LiquidStakingCurrency,
  isNative: boolean,
) => {
  return useApiRx(
    useCallback(
      (api) => {
        const key: LiquidStakingCurrencyKey = isNative
          ? { Native: currency }
          : { lst: currency };

        return api.query.lstMinting.ongoingTimeUnit(key);
      },
      [currency, isNative],
    ),
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );
};

export default useOngoingTimeUnit;
