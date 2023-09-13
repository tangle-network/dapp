import { useMemo } from 'react';
import { useLocation } from 'react-router';
import { BRIDGE_TABS } from '../constants';

/**
 * Returns the current transaction tab on the bridge
 * based on the current location pathname
 * @returns the current transaction tab on the bridge,
 * available values are `deposit`, `withdraw`, `transfer` or `undefined`
 */
const useTxTabFromRoute = () => {
  const { pathname } = useLocation();

  return useMemo(() => {
    return BRIDGE_TABS.find((tab) => pathname.includes(tab));
  }, [pathname]);
};

export default useTxTabFromRoute;
