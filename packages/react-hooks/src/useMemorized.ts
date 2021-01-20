import { useState, useEffect, useRef } from 'react';

export const useMemorized = <T extends unknown>(value: T): T => {
  const [_value, setValue] = useState<T>(value);
  const ref = useRef<T>(value);

  useEffect(() => {
    if (JSON.stringify(ref.current) !== JSON.stringify(value)) {
      ref.current = value;
      setValue(value);
    }
  }, [value, setValue]);

  return _value;
};
