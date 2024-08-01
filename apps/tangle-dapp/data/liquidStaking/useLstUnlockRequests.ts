import { Option, u128 } from '@polkadot/types';
import { AccountId32 } from '@polkadot/types/interfaces';
import {
  TanglePrimitivesCurrencyCurrencyId,
  TanglePrimitivesRedeemType,
  TanglePrimitivesTimeUnit,
} from '@polkadot/types/lookup';
import { ITuple } from '@polkadot/types/types';
import { BN } from '@polkadot/util';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { useCallback, useMemo } from 'react';
import { map } from 'rxjs';

import {
  ParachainCurrency,
  SimpleTimeUnitInstance,
} from '../../constants/liquidStaking';
import useApiRx from '../../hooks/useApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import compareSubstrateAddresses from '../../utils/compareSubstrateAddresses';
import tangleTimeUnitToSimpleInstance from '../../utils/liquidStaking/tangleTimeUnitToSimpleInstance';
import getValueOfTangleCurrency from './getValueOfTangleCurrency';

export type LstUnlockRequest = {
  unlockId: number;
  currencyType: TanglePrimitivesCurrencyCurrencyId['type'];
  currency: ParachainCurrency;
  unlockTimeUnit: SimpleTimeUnitInstance;
  amount: BN;
};

const useLstUnlockRequests = () => {
  const substrateAddress = useSubstrateAddress();

  const { result: entries } = useApiRx(
    useCallback(
      (api) => {
        if (substrateAddress === null) {
          return null;
        }

        return api.query.lstMinting.userUnlockLedger.entries(substrateAddress);
      },
      [substrateAddress],
    ),
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );

  const unlockIds = useMemo(() => {
    if (entries === null) {
      return null;
    }

    return entries.flatMap(([_key, value]) => {
      // Ignore empty values. Since `flatMap` is used, returning an empty
      // array will filter out this entry.
      if (value.isNone) {
        return [];
      }

      return value.unwrap()[1].map((unlockId) => unlockId.toNumber());
    });
  }, [entries]);

  const { result: tokenUnlockLedgers } = useApiRx(
    useCallback(
      (api) => {
        if (unlockIds === null) {
          return null;
        }

        return api.query.lstMinting.tokenUnlockLedger.entries().pipe(
          map((entries) => {
            return entries.map(([key, value]) => {
              // TODO: For some reason, `.entries()` is returning the value as `Codec`. Might be a gap in the generated types. For now, manually cast it to the correct type.
              const castedValue = value as Option<
                ITuple<
                  [
                    AccountId32,
                    u128,
                    TanglePrimitivesTimeUnit,
                    TanglePrimitivesRedeemType,
                  ]
                >
              >;

              return [key, castedValue] as const;
            });
          }),
        );
      },
      [unlockIds],
    ),
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );

  const simplifiedRequests = useMemo<LstUnlockRequest[] | null>(() => {
    if (tokenUnlockLedgers === null || substrateAddress === null) {
      return null;
    }

    return tokenUnlockLedgers.flatMap(([key, valueOpt]) => {
      // Ignore empty values. Since `flatMap` is used, returning an empty
      // array will filter out this entry.
      if (valueOpt.isNone) {
        return [];
      }

      const value = valueOpt.unwrap();

      // Ignore entries that don't belong to the current account.
      if (!compareSubstrateAddresses(value[0].toString(), substrateAddress)) {
        return [];
      }

      // The time unit at which the token will be unlocked.
      const unlockTimeUnit = tangleTimeUnitToSimpleInstance(value[2]);

      const currencyType = key.args[0].type;
      const currency = getValueOfTangleCurrency(key.args[0]);
      const amount = value[1];
      const unlockId = key.args[1].toNumber();

      return [{ unlockId, currencyType, currency, unlockTimeUnit, amount }];
    });
  }, [substrateAddress, tokenUnlockLedgers]);

  return simplifiedRequests;
};

export default useLstUnlockRequests;
