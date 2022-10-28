import { DimensionsStateProps } from './types';
import { size } from '..';
import React, { PropsWithChildren, useEffect, useState } from 'react';

export const getDefaultValues = () => {
  if (typeof window !== 'undefined') {
    return {
      state: {
        scroll: {
          x: window.scrollX,
          y: window.scrollY,
        },
        window: {
          height: window.innerHeight,
          width: window.innerWidth,
        },
      },
    };
  }
  return {
    state: {
      scroll: {
        x: 0,
        y: 0,
      },
      window: {
        height: 0,
        width: size.md + 1,
      },
    },
  };
};
const def = getDefaultValues();

export const dimensionContext = React.createContext<DimensionsStateProps>(def);

export const DimensionsProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState(getDefaultValues().state);
  useEffect(() => {
    setState(getDefaultValues().state);
    const scrollHandler = () => {
      setState((p) => ({
        ...p,
        scroll: {
          ...p.scroll,
          x: window.scrollX,
          y: window.scrollY,
        },
      }));
    };
    const resizeHandler = () => {
      setState((p) => ({
        ...p,
        window: {
          height: window.innerHeight,
          width: window.innerWidth,
        },
      }));
    };
    if (!window) {
      return;
    }
    window.addEventListener('resize', resizeHandler);
    window.addEventListener('scroll', scrollHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      window.removeEventListener('scroll', scrollHandler);
    };
  }, []);
  return (
    <dimensionContext.Provider
      value={{
        state,
      }}
    >
      {children}
    </dimensionContext.Provider>
  );
};
