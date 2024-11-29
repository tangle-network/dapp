import { useLocation } from 'react-router-dom';

export const useLayoutBgClassName = () => {
  const { pathname } = useLocation();

  if (pathname.includes('/liquid-staking')) {
    return 'ls-bg-body';
  }

  return 'bg-body';
};
