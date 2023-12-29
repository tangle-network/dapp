import { useState, useEffect } from 'react';

export enum TailwindBreakpoint {
  XS = 0,
  SM = 640,
  MD = 768,
  LG = 1024,
  XL = 1280,
  XXL = 1536,
}

export const useTailwindBreakpoint = (): TailwindBreakpoint => {
  const [currentBreakpoint, setCurrentBreakpoint] =
    useState<TailwindBreakpoint>(TailwindBreakpoint.XS);

  const determineBreakpoint = (width: number): TailwindBreakpoint => {
    if (width < TailwindBreakpoint.SM) return TailwindBreakpoint.XS;
    if (width < TailwindBreakpoint.MD) return TailwindBreakpoint.SM;
    if (width < TailwindBreakpoint.LG) return TailwindBreakpoint.MD;
    if (width < TailwindBreakpoint.XL) return TailwindBreakpoint.LG;
    if (width < TailwindBreakpoint.XXL) return TailwindBreakpoint.XL;

    return TailwindBreakpoint.XXL;
  };

  useEffect(() => {
    const handleResize = () => {
      setCurrentBreakpoint(determineBreakpoint(window.innerWidth));
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return currentBreakpoint;
};

export default useTailwindBreakpoint;
