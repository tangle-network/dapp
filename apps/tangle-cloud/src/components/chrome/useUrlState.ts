import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

type Codec<T> = {
  parse: (raw: string | null) => T;
  serialize: (value: T) => string | null;
};

/**
 * Two-way bind a piece of UI state to a URL query parameter. Returns a tuple
 * shaped like `useState` so callers can drop it in.
 *
 *   const [search, setSearch] = useUrlState('q', stringCodec(''));
 *
 * The codec's `serialize` returns `null` when the value should be removed
 * from the URL (typically the default — keeps share-links tidy).
 *
 * URL state is the right home for anything the user expects to persist
 * across refresh or share with a teammate: search query, filter selections,
 * view mode, density, page index. Component-local state stays in component
 * state; "is this drawer open" doesn't belong in the URL.
 */
export function useUrlState<T>(
  key: string,
  codec: Codec<T>,
): [T, (next: T | ((prev: T) => T)) => void] {
  const [params, setParams] = useSearchParams();
  const raw = params.get(key);
  const value = useMemo(() => codec.parse(raw), [raw, codec]);
  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === 'function' ? (next as (prev: T) => T)(value) : next;
      const serialized = codec.serialize(resolved);
      const updated = new URLSearchParams(params);
      if (serialized === null) {
        updated.delete(key);
      } else {
        updated.set(key, serialized);
      }
      setParams(updated, { replace: true });
    },
    [params, setParams, key, codec, value],
  );
  return [value, setValue];
}

/** String codec with a configurable default. Empty string → param removed. */
export function stringCodec(defaultValue = ''): Codec<string> {
  return {
    parse: (raw) => raw ?? defaultValue,
    serialize: (value) =>
      value === defaultValue || value === '' ? null : value,
  };
}

/** Enum codec — restricts to a known set and falls back to the default. */
export function enumCodec<T extends string>(
  values: readonly T[],
  defaultValue: T,
): Codec<T> {
  return {
    parse: (raw) =>
      raw && (values as readonly string[]).includes(raw)
        ? (raw as T)
        : defaultValue,
    serialize: (value) => (value === defaultValue ? null : value),
  };
}

/** Integer codec with a default. Negative numbers are allowed but invalid input
 * resolves to the default. */
export function intCodec(defaultValue = 0): Codec<number> {
  return {
    parse: (raw) => {
      if (raw === null) return defaultValue;
      const n = Number.parseInt(raw, 10);
      return Number.isFinite(n) ? n : defaultValue;
    },
    serialize: (value) => (value === defaultValue ? null : String(value)),
  };
}
