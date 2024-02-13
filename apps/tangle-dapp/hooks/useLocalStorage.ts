import { useCallback, useEffect, useState } from 'react';

export enum LocalStorageKey {
  AirdropEligibilityCache = 'airdropEligibilityCache',
  IsBalancesTableDetailsCollapsed = 'isBalancesTableDetailsCollapsed',
}

export type AirdropEligibilityCache = {
  [address: string]: boolean;
};

export type LocalStorageValueType<T extends LocalStorageKey> =
  T extends LocalStorageKey.AirdropEligibilityCache
    ? AirdropEligibilityCache
    : T extends LocalStorageKey.IsBalancesTableDetailsCollapsed
    ? boolean
    : never;

const extractFromLocalStorage = <Key extends LocalStorageKey>(
  key: Key,
  canClearIfInvalid: boolean
): LocalStorageValueType<Key> | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const jsonString = window.localStorage.getItem(key);

  // Item was not present in local storage.
  if (jsonString === null) {
    return null;
  }

  const value: LocalStorageValueType<Key> | null = null;

  try {
    // TODO: Use zod to validate the value, this helps prevent logic errors.
    JSON.parse(jsonString) as LocalStorageValueType<Key>;
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
  const [value, setValue] = useState<LocalStorageValueType<Key> | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    return extractFromLocalStorage(key, isUsedAsCache);
  });

  const refresh = useCallback(() => {
    const isDevelopmentMode = process.env.NODE_ENV === 'development';

    // In development mode, invalidate and return `null` for values
    // from local storage used as cache. This approach is particularly
    // useful for scenarios like sudo actions in development, where normally
    // static data might change unexpectedly (ie. sudo actions are performed
    // that change things that are normally static, such as airdrop eligibility).
    if (isDevelopmentMode && isUsedAsCache) {
      console.debug(
        `Retrieved the cache key '${key}' from local storage. However, as the application is currently in development mode, caches are invalidated and 'null' is returned. This ensures fresh data is always loaded during development.`
      );

      return null;
    }

    return extractFromLocalStorage(key, isUsedAsCache);
  }, [isUsedAsCache, key]);

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
