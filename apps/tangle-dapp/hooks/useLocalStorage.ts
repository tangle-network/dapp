'use client';

import { useCallback, useEffect, useState } from 'react';

import { Delegator, Payout, Validator } from '../types';

export enum LocalStorageKey {
  ACTIVE_VALIDATOR_CACHE = 'activeValidatorCache',
  WAITING_VALIDATOR_CACHE = 'waitingValidatorCache',
  IS_BALANCES_TABLE_DETAILS_COLLAPSED = 'isBalancesTableDetailsCollapsed',
  ACTIVE_AND_DELEGATION_COUNT = 'activeAndDelegationCount',
  IDEAL_STAKE_PERCENTAGE = 'idealStakePercentage',
  VALIDATOR_COUNTS = 'validatorCounts',
  WAITING_COUNT = 'waitingCount',
  Payouts = 'payouts',
  Nominations = 'nominations',
  CUSTOM_RPC_ENDPOINT = 'customRpcEndpoint',
  KNOWN_NETWORK_ID = 'knownNetworkId',
  VALIDATORS = 'validators',
  WAS_BANNER_DISMISSED = 'wasBannerDismissed',
}

export type AirdropEligibilityCache = {
  [address: string]: boolean;
};

export type PayoutsCache = {
  [address: string]: Payout[];
};

export type NominationsCache = {
  [address: string]: Delegator[];
};

/**
 * Type definition associating local storage keys with their
 * respective value types.
 */
export type LocalStorageValueOf<T extends LocalStorageKey> =
  T extends LocalStorageKey.IS_BALANCES_TABLE_DETAILS_COLLAPSED
    ? boolean
    : T extends
        | LocalStorageKey.ACTIVE_VALIDATOR_CACHE
        | LocalStorageKey.WAITING_VALIDATOR_CACHE
    ? Validator[]
    : T extends LocalStorageKey.ACTIVE_AND_DELEGATION_COUNT
    ? { value1: number | null; value2: number | null }
    : T extends LocalStorageKey.IDEAL_STAKE_PERCENTAGE
    ? { value1: number | null }
    : T extends LocalStorageKey.VALIDATOR_COUNTS
    ? { value1: number | null; value2: number | null }
    : T extends LocalStorageKey.WAITING_COUNT
    ? { value1: number | null }
    : T extends LocalStorageKey.Payouts
    ? PayoutsCache
    : T extends LocalStorageKey.Nominations
    ? NominationsCache
    : T extends LocalStorageKey.CUSTOM_RPC_ENDPOINT
    ? string
    : T extends LocalStorageKey.KNOWN_NETWORK_ID
    ? number
    : T extends LocalStorageKey.WAS_BANNER_DISMISSED
    ? boolean
    : never;

export const extractFromLocalStorage = <Key extends LocalStorageKey>(
  key: Key,
  canClearIfInvalid: boolean
): LocalStorageValueOf<Key> | null => {
  type Value = LocalStorageValueOf<Key>;

  const jsonString = localStorage.getItem(key);

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
      localStorage.removeItem(key);
    }
  }

  return value;
};

// TODO: During development cycles, changing local storage value types will lead to any users depending on that value to possibly break (because they may be stuck with an older type schema). Need a fallback mechanism that erases the old value if applicable (ie. if it's something not important, but rather used for caching).
/**
 * Custom hook for interacting with local storage.
 *
 * Note that the returned value will be `null` initially, until the
 * component is mounted and the value is extracted from local storage.
 *
 * For that reason, if depending on this hook for initial, default states,
 * it's recommended to instead use a `useEffect` and manually retrieve the
 * value from local storage on mount, using the `get` method.
 */
const useLocalStorage = <Key extends LocalStorageKey>(
  key: Key,
  isUsedAsCache = false
) => {
  type Value = LocalStorageValueOf<Key>;

  // Initially, the value is `null` until the component is mounted
  // and the value is extracted from local storage. The explicit
  // name of the state variable indicates that.
  const [valueAfterMount, setLateValue] = useState<Value | null>(null);

  const get = useCallback(() => {
    const freshValue = extractFromLocalStorage<Key>(key, isUsedAsCache);

    setLateValue(freshValue);

    return freshValue;
  }, [isUsedAsCache, key]);

  // Extract the value from local storage on mount.
  useEffect(() => {
    get();
  }, [get]);

  // Listen for changes to local storage. This is useful in case
  // that other logic changes the local storage value.
  useEffect(() => {
    const handleStorageChange = () => {
      setLateValue(get());
    };

    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, get]);

  const set = useCallback(
    (value: Value) => {
      setLateValue(value);
      localStorage.setItem(key, JSON.stringify(value));
      console.debug('Set local storage value:', key, value);
    },
    [key]
  );

  const isSet = useCallback(() => localStorage.getItem(key) !== null, [key]);

  const remove = useCallback(() => {
    if (!isSet()) {
      return;
    }

    setLateValue(null);
    localStorage.removeItem(key);
    console.debug('Removed local storage key:', key);
  }, [isSet, key]);

  const setWithPreviousValue = useCallback(
    (updater: (previousValue: Value | null) => Value) => {
      const previousValue = get();
      const nextValue = updater(previousValue);

      set(nextValue);
    },
    [get, set]
  );

  return {
    valueAfterMount,
    set,
    setWithPreviousValue,
    remove,
    get,
    isSet,
  };
};

export default useLocalStorage;
