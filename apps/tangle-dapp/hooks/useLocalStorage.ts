import { useCallback, useEffect, useState } from 'react';

export enum LocalStorageKey {
  AirdropEligibilityCache = 'airdropEligibilityCache',
  IsBalancesTableDetailsCollapsed = 'isBalancesTableDetailsCollapsed',
}

type AirdropEligibilityCache = {
  [address: string]: boolean;
};

export type LocalStorageValueType<T extends LocalStorageKey> =
  T extends LocalStorageKey.AirdropEligibilityCache
    ? AirdropEligibilityCache
    : T extends LocalStorageKey.IsBalancesTableDetailsCollapsed
    ? boolean
    : never;

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

    const item = window.localStorage.getItem(key);

    // TODO: Use zod to validate the value, this helps prevent logic errors.
    return item !== null
      ? (JSON.parse(item) as LocalStorageValueType<Key>)
      : null;
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

    const value = localStorage.getItem(key);

    // TODO: Use zod to validate the value, this helps prevent logic errors.
    return value !== null
      ? (JSON.parse(value) as LocalStorageValueType<Key>)
      : null;
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

  return { value, set, remove, refresh };
};

export default useLocalStorage;
