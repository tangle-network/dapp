import { useMemo } from 'react';

const useEntryMap = <Key, Value, MappedKey>(
  entries: Array<[Key, Value]> | null,
  mapKey: (key: Key) => MappedKey
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
