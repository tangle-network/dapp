import { useMemo } from 'react';
import { useLocation } from 'react-router';
import { WRAPPER_TABS } from '../constants';

/**
 * Returns the current wrapper tab on the bridge
 * based on the current location pathname
 * @returns the current transaction tab on the bridge,
 * available values are `wrap`, `unwrap` or `undefined`
 */
const useWrapperTabFromRoute = () => {
  const { pathname } = useLocation();

  return useMemo(() => {
    return WRAPPER_TABS.find((tab) => pathname.includes(tab));
  }, [pathname]);
};

export default useWrapperTabFromRoute;
