import useApiRx from '@webb-tools/tangle-shared-ui/hooks/useApiRx';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { useCallback } from 'react';
import { map } from 'rxjs';

import permillToPercentage from '../../../utils/permillToPercentage';

const useParachainLsFees = () => {
  return useApiRx(
    useCallback((api) => {
      return api.query.lstMinting.fees().pipe(
        map((fees) => {
          const mintFeePercentage = permillToPercentage(fees[0]);
          const redeemFeePercentage = permillToPercentage(fees[1]);

          return {
            mintFeePercentage,
            redeemFeePercentage,
          };
        }),
      );
    }, []),
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );
};

export default useParachainLsFees;
