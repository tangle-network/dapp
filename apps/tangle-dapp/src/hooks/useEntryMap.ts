import { useMemo } from 'react';

// Hook wrapper keeps a stable memoized map for components that depend on referential equality.
const useEntryMap = <Key, Value, MappedKey>(
  entries: Array<[Key, Value]> | null,
  mapKey: (key: Key) => MappedKey,
): Map<MappedKey, Value> | null =>
  useMemo(() => {
    if (entries === null) {
      return null;
    }

    const map = new Map<MappedKey, Value>();

    for (const [key, value] of entries) {
      const mappedKey = mapKey(key);

      map.set(mappedKey, value);
    }

    return map;
  }, [entries, mapKey]);

export default useEntryMap;
