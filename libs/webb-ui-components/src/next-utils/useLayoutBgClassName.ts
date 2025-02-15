'use client';

export const useLayoutBgClassName = () => {
  // TODO: Remove
  const pathname = '';

  if (pathname.includes('/liquid-staking')) {
    return 'ls-bg-body';
  }

  return 'bg-body';
};
