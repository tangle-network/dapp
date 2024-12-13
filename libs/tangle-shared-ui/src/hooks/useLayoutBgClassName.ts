'use client';

import { useLocation } from 'react-router';

export const useLayoutBgClassName = () => {
  const location = useLocation();

  if (location.pathname.includes('/liquid-staking')) {
    return 'ls-bg-body';
  }

  return 'bg-body';
};
