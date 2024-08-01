import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';

import { ParachainCurrency } from '../../constants/liquidStaking';
import useApiRx from '../../hooks/useApiRx';

// TODO: Do a bit more research on what this signifies and means. Currently, it is only known that this is a requirement/check that may prevent further redeeming.
const useDelegationsOccupiedStatus = (currency: ParachainCurrency) => {
  return useApiRx((api) => {
    return api.query.slp.delegationsOccupied({ Native: currency });
  }, TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint);
};

export default useDelegationsOccupiedStatus;
