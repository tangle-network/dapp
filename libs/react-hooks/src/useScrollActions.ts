import { useCallback } from 'react';

const useScrollActions = () => {
  const smoothScrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  return {
    smoothScrollToTop,
  };
};

export default useScrollActions;
