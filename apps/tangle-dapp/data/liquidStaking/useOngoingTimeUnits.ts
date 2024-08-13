import { TanglePrimitivesCurrencyCurrencyId } from '@polkadot/types/lookup';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { useCallback, useMemo } from 'react';

import {
  ParachainCurrency,
  LsSimpleParachainTimeUnit,
} from '../../constants/liquidStaking/liquidStakingParachain';
import useApiRx from '../../hooks/useApiRx';
import tangleTimeUnitToSimpleInstance from '../../utils/liquidStaking/tangleTimeUnitToSimpleInstance';
import getValueOfTangleCurrency from './getValueOfTangleCurrency';

export type OngoingTimeUnitEntry = {
  currencyType: TanglePrimitivesCurrencyCurrencyId['type'];
  currency: ParachainCurrency;
  timeUnit: LsSimpleParachainTimeUnit;
};

const useOngoingTimeUnits = () => {
  const { result: entries } = useApiRx(
    useCallback((api) => {
      return api.query.lstMinting.ongoingTimeUnit.entries();
    }, []),
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );

  const ongoingTimeUnits = useMemo<OngoingTimeUnitEntry[] | null>(() => {
    if (entries === null) {
      return null;
    }

    return entries.flatMap(([key, value]) => {
      // Ignore empty values. Since `flatMap` is used, returning an empty
      // array will filter out this entry.
      if (value.isNone) {
        return [];
      }

      const simpleTimeUnitInstance = tangleTimeUnitToSimpleInstance(
        value.unwrap(),
      );

      const currencyType = key.args[0].type;
      const currency = getValueOfTangleCurrency(key.args[0]);

      return [
        {
          currencyType,
          currency,
          timeUnit: simpleTimeUnitInstance,
        },
      ];
    });
  }, [entries]);

  return ongoingTimeUnits;
};

export default useOngoingTimeUnits;
