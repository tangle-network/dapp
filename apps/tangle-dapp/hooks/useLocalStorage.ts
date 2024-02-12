'use client';

import { useCallback, useEffect, useState } from 'react';

import { Validator } from '../types';

export enum LocalStorageKey {
  ActiveValidatorCache = 'activeValidatorCache',
  WaitingValidatorCache = 'waitingValidatorCache',
  AirdropEligibilityCache = 'airdropEligibilityCache',
  IsBalancesTableDetailsCollapsed = 'isBalancesTableDetailsCollapsed',
}

export type AirdropEligibilityCache = {
  [address: string]: boolean;
};

/**
 * Type definition associating local storage keys with their
 * respective value types.
 */
export type LocalStorageValueType<T extends LocalStorageKey> =
  T extends LocalStorageKey.AirdropEligibilityCache
    ? AirdropEligibilityCache
    : T extends LocalStorageKey.IsBalancesTableDetailsCollapsed
    ? boolean
    : T extends
        | LocalStorageKey.ActiveValidatorCache
        | LocalStorageKey.WaitingValidatorCache
    ? Validator[]
    : never;

const extractFromLocalStorage = <Key extends LocalStorageKey>(
  key: Key,
  canClearIfInvalid: boolean
): LocalStorageValueType<Key> | null => {
  const jsonString = window.localStorage.getItem(key);

  // Item was not present in local storage.
  if (jsonString === null) {
    return null;
  }

  let value: LocalStorageValueType<Key> | null = null;

  // Clear the local storage value if parsing fails, and the
  // entry is set to be cleared if invalid.
  try {
    // TODO: Use zod to validate the value, this helps prevent logic errors.
    value = JSON.parse(jsonString) as LocalStorageValueType<Key>;
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
  // Use lazy state initialization to avoid reading from
  // local storage on every render.
  const [value, setValue] = useState<LocalStorageValueType<Key> | null>(null);

  const refresh = useCallback(() => {
    const freshValue = extractFromLocalStorage(key, isUsedAsCache);

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
    (value: LocalStorageValueType<Key>) => {
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
    (
      updater: (
        previousValue: LocalStorageValueType<Key> | null
      ) => LocalStorageValueType<Key>
    ) => {
      const previousValue = refresh();
      const nextValue = updater(previousValue);

      set(nextValue);
    },
    [refresh, set]
  );

  return { value, set, setWithPreviousValue, remove, refresh };
};

export default useLocalStorage;
