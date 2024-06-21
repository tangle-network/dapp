'use client';

import { usePathname } from 'next/navigation';

export const useLayoutBgClassname = () => {
  const pathname = usePathname();

  if (pathname.includes('/liquid-staking')) {
    return 'ls-bg-body';
  }

  return 'bg-body';
};
