import { useEffect, useRef } from 'react';

/**
 * An utility hook to abstract the pattern of checking whether
 * the component is mounted or not in callbacks inside effects,
 * to prevent memory leaks.
 */
const useIsMountedRef = () => {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  return isMounted;
};

export default useIsMountedRef;
