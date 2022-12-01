import { dimensionContext } from './DimensionsProvider';
import { size } from '..';
import { useCallback, useContext } from 'react';

export const useDimensions = () => {
  const {
    state: { window },
  } = useContext(dimensionContext);
  return { ...window, size };
};

export const useScroll = () => {
  const {
    state: { scroll },
  } = useContext(dimensionContext);
  return scroll;
};

export const useScrollActions = () => {
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
