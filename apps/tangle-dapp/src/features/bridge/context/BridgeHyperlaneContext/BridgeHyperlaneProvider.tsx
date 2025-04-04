import { FC, PropsWithChildren, useEffect } from 'react';
import {
  initHyperlaneWarpContext,
  removeHyperlaneWarpContext,
} from './BridgeHyperlaneContext';

const BridgeHyperlaneProvider: FC<PropsWithChildren> = ({ children }) => {
  useEffect(() => {
    const initHyperlane = async () => {
      try {
        await initHyperlaneWarpContext();
      } catch (error) {
        console.error('Failed to initialize Hyperlane Warp Context', error);
        removeHyperlaneWarpContext();
      }
    };

    initHyperlane();
  }, []);

  return children;
};

export default BridgeHyperlaneProvider;
