import { useContext } from 'react';
import { dimensionContext } from '@webb-dapp/react-environment/layout/DimensionsProvider';
import { size } from '@webb-dapp/ui-components/utils/responsive-utils';

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
