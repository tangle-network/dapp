import { dimensionContext } from './DimensionsProvider';
import { size } from '..';
import { useContext } from 'react';

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
