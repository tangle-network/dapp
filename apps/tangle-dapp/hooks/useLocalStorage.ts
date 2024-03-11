'use client';

import { useCallback, useEffect, useState } from 'react';

import { Validator } from '../types';

export enum LocalStorageKey {
  ACTIVE_VALIDATOR_CACHE = 'activeValidatorCache',
  WAITING_VALIDATOR_CACHE = 'waitingValidatorCache',
  AIRDROP_ELIGIBILITY_CACHE = 'airdropEligibilityCache',
  IS_BALANCES_TABLE_DETAILS_COLLAPSED = 'isBalancesTableDetailsCollapsed',
  ACTIVE_AND_DELEGATION_COUNT = 'activeAndDelegationCount',
  IDEAL_STAKE_PERCENTAGE = 'idealStakePercentage',
  VALIDATOR_COUNTS = 'validatorCounts',
  WAITING_COUNT = 'waitingCount',
}

export type AirdropEligibilityCache = {
  [address: string]: boolean;
};

/**
 * Type definition associating local storage keys with their
 * respective value types.
 */
export type LocalStorageValueOf<T extends LocalStorageKey> =
  T extends LocalStorageKey.AIRDROP_ELIGIBILITY_CACHE
    ? AirdropEligibilityCache
    : T extends LocalStorageKey.IS_BALANCES_TABLE_DETAILS_COLLAPSED
    ? boolean
    : T extends LocalStorageKey.ACTIVE_VALIDATOR_CACHE
    ? Validator[]
    : T extends LocalStorageKey.ACTIVE_AND_DELEGATION_COUNT
    ? { value1: number | null; value2: number | null }
    : T extends LocalStorageKey.IDEAL_STAKE_PERCENTAGE
    ? { value1: number | null }
    : T extends LocalStorageKey.VALIDATOR_COUNTS
    ? { value1: number | null; value2: number | null }
    : T extends LocalStorageKey.WAITING_COUNT
    ? { value1: number | null }
    : never;

export const extractFromLocalStorage = <Key extends LocalStorageKey>(
  key: Key,
  canClearIfInvalid: boolean
): LocalStorageValueOf<Key> | null => {
  type Value = LocalStorageValueOf<Key>;

  const jsonString = window.localStorage.getItem(key);

  // Item was not present in local storage.
  if (jsonString === null) {
    return null;
  }

  let value: Value | null = null;

  // Clear the local storage value if parsing fails, and the
  // entry is set to be cleared if invalid.
  try {
    // TODO: Use zod to validate the value, this helps prevent logic errors.
    value = JSON.parse(jsonString) as Value;
  } catch {
    if (canClearIfInvalid) {
      window.localStorage.removeItem(key);
    }
  }

  return value;
};

// TODO: During development cycles, changing local storage value types will lead to any users depending on that value to possibly break (because they may be stuck with an older type schema). Need a fallback mechanism that erases the old value if applicable (ie. if it's something not important, but rather used for caching).
const useLocalStorage = <Key extends LocalStorageKey>(
  key: Key,
  isUsedAsCache = false
) => {
  type Value = LocalStorageValueOf<Key>;

  // Use lazy state initialization to avoid reading from
  // local storage on every render.
  const [value, setValue] = useState<Value | null>(null);

  const refresh = useCallback(() => {
    const freshValue = extractFromLocalStorage<Key>(key, isUsedAsCache);

    setValue(freshValue);

    return freshValue;
  }, [isUsedAsCache, key]);

  // Extract the value from local storage on mount.
  useEffect(() => {
    refresh();
  }, [isUsedAsCache, key, refresh]);

  // Listen for changes to local storage. This is useful in case
  // that other logic changes the local storage value.
  useEffect(() => {
    const handleStorageChange = () => {
      setValue(refresh());
    };

    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, refresh]);

  const set = useCallback(
    (value: Value) => {
      setValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    },
    [key]
  );

  const remove = useCallback(() => {
    setValue(null);
    localStorage.removeItem(key);
  }, [key]);

  const setWithPreviousValue = useCallback(
    (updater: (previousValue: Value | null) => Value) => {
      const previousValue = refresh();
      const nextValue = updater(previousValue);

      set(nextValue);
    },
    [refresh, set]
  );

  return { value, set, setWithPreviousValue, remove, refresh };
};

export default useLocalStorage;
