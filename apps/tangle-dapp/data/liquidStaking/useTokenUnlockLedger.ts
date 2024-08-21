// This will override global types and provide type definitions for
// the `lstMinting` pallet, allowing us to use the `mint` extrinsic.
import '@webb-tools/tangle-restaking-types';

import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { useCallback, useMemo } from 'react';

import { LsParachainCurrencyKey } from '../../constants/liquidStaking/types';
import useApiRx from '../../hooks/useApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import tangleTimeUnitToSimpleInstance from '../../utils/liquidStaking/tangleTimeUnitToSimpleInstance';

// TODO: Providing a key here doesn't make much sense; find a way to get all the entries for the current account, without needing to provide a key.
const useTokenUnlockLedger = (key: LsParachainCurrencyKey) => {
  const substrateAddress = useSubstrateAddress();

  const { result: entries } = useApiRx(
    useCallback(
      (api) => {
        return api.query.lstMinting.tokenUnlockLedger.entries(key);
      },
      [key],
    ),
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );

  // The structure of the fetched data is a bit complex, so simplify it
  // here to make it easier to work with.
  const simplifiedUnlockLedger = useMemo(() => {
    if (entries === null || substrateAddress === null) {
      return null;
    }

    return entries.flatMap(([key, value]) => {
      // Only get the entries that match the current account.
      if (value.isNone || value.unwrap()[0].toString() !== substrateAddress) {
        return [];
      }

      // The time unit at which the token will be unlocked.
      const redeemTimeUnit = tangleTimeUnitToSimpleInstance(value.unwrap()[2]);

      // TODO: Why is the currency returned, aren't we already providing it via the `key`? Won't it always be the same? If it'll always be the same, we can remove it from this return value, since it would be redundant.
      const currencyType = key.args[0].type;

      const unlockId = key.args[1].toNumber();

      return [{ unlockId, currencyType, redeemTimeUnit }];
    });
  }, [entries, substrateAddress]);

  return simplifiedUnlockLedger;
};

export default useTokenUnlockLedger;
