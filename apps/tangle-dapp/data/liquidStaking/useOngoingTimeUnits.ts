import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { useCallback, useMemo } from 'react';

import useApiRx from '../../hooks/useApiRx';
import getAmountOfTangleCurrency from './getAmountOfTangleCurrency';

const useOngoingTimeUnits = () => {
  const { result: ongoingTimeUnits } = useApiRx(
    useCallback((api) => {
      return api.query.lstMinting.ongoingTimeUnit.entries();
    }, []),
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );

  const ongoingTimeUnitsMap = useMemo(() => {
    if (ongoingTimeUnits === null) {
      return null;
    }

    // TODO: This is incomplete, because the key must also account for the currency type (ie. Native, LST, etc.).
    return new Map(
      ongoingTimeUnits.map(([key, value]) => [
        getAmountOfTangleCurrency(key.args[0]),
        value,
      ]),
    );
  }, [ongoingTimeUnits]);

  return ongoingTimeUnitsMap;
};

export default useOngoingTimeUnits;
