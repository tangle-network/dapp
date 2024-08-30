import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { useCallback } from 'react';
import { map } from 'rxjs';

import useApiRx from '../../hooks/useApiRx';
import permillToPercentage from '../../utils/permillToPercentage';

const useParachainLsFees = () => {
  return useApiRx(
    useCallback((api) => {
      return api.query.lstMinting.fees().pipe(
        map((fees) => {
          const mintFee = permillToPercentage(fees[0]);
          const redeemFee = permillToPercentage(fees[1]);

          return {
            mintFee,
            redeemFee,
          };
        }),
      );
    }, []),
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );
};

export default useParachainLsFees;
