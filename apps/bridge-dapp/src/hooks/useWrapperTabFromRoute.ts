import { useMemo } from 'react';
import { useLocation } from 'react-router';

/**
 * Returns the current wrapper tab on the bridge
 * based on the current location pathname
 * @returns the current transaction tab on the bridge,
 * available values are `wrap`, `unwrap` or `undefined`
 */
const useWrapperTabFromRoute = () => {
  const { pathname } = useLocation();

  return useMemo(() => {
    if (pathname.includes('unwrap')) return 'unwrap';
    if (pathname.includes('wrap')) return 'wrap';
    return undefined;
  }, [pathname]);
};

export default useWrapperTabFromRoute;
