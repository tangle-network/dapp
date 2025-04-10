import isEqual from 'lodash/isEqual';
import { useEffect, useState } from 'react';

/**
 * Memoizes a value using deep equality comparison.
 * Only updates the reference when the value actually changes.
 *
 * @param value The value to memoize
 * @returns The memoized value
 *
 * @example
 * ```tsx
 * const MyComponent = ({ data }) => {
 *   // Only updates when data actually changes
 *   const memoizedData = useMemorizedValue(data);
 *
 *   return <div>{JSON.stringify(memoizedData)}</div>;
 * };
 * ```
 */
export const useMemorizedValue = <T>(value: T): T => {
  const [memorizedValue, setMemorizedValue] = useState<T>(value);

  useEffect(() => {
    setMemorizedValue((prev) => {
      if (isEqual(prev, value)) {
        return prev;
      }

      return value;
    });
  }, [value]);

  return memorizedValue;
};
