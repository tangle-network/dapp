import { useContext } from 'react';
import { dimensionContext } from '@webb-dapp/react-environment/layout/DimensionsProvider';

export const useDimensions = () => {
  const {
    state: { window },
  } = useContext(dimensionContext);
  return window;
};

export const useScroll = () => {
  const {
    state: { scroll },
  } = useContext(dimensionContext);
  return scroll;
};
