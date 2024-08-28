// This will override global types and provide type definitions for
// the `lstMinting` pallet.
import '@webb-tools/tangle-restaking-types';

import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { useCallback, useMemo } from 'react';

import {
  LsParachainSimpleTimeUnit,
  ParachainCurrency,
} from '../../constants/liquidStaking/types';
import useApiRx from '../../hooks/useApiRx';
import tangleTimeUnitToSimpleInstance from '../../utils/liquidStaking/tangleTimeUnitToSimpleInstance';
import getValueOfTangleCurrency from './getValueOfTangleCurrency';

export type TokenUnlockDurationEntry = {
  isNative: boolean;
  currency: ParachainCurrency;
  timeUnit: LsParachainSimpleTimeUnit;
};

const useTokenUnlockDurations = () => {
  const { result: entries } = useApiRx(
    useCallback((api) => {
      return api.query.lstMinting.unlockDuration.entries();
    }, []),
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );

  const simplifiedEntries = useMemo<TokenUnlockDurationEntry[] | null>(() => {
    if (entries === null) {
      return null;
    }

    return entries.flatMap(([key, valueOpt]) => {
      // Ignore entries with no value.
      if (valueOpt.isNone) {
        return [];
      }

      const currencyId = key.args[0];

      return [
        {
          isNative: currencyId.isNative,
          currency: getValueOfTangleCurrency(currencyId),
          timeUnit: tangleTimeUnitToSimpleInstance(valueOpt.unwrap()),
        } satisfies TokenUnlockDurationEntry,
      ];
    });
  }, [entries]);

  return simplifiedEntries;
};

export default useTokenUnlockDurations;
