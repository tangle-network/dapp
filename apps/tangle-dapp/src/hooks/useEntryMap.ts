import { useMemo } from 'react';

// TODO: Simplify this into an utility function, or if it'll stay as a hook, provide more information explaining its purpose. Currently, it doesn't use any React hooks or context, so it would be better to have it as an utility function instead.
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
