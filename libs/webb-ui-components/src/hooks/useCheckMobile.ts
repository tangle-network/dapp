import { useState, useEffect } from 'react';

export type UseCheckMobileReturnType = {
  isMobile: boolean;
};

export const useCheckMobile = (): UseCheckMobileReturnType => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      console.log('device: ', navigator.userAgent);
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      setIsMobile(isMobile);
    };

    checkIsMobile();

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return { isMobile };
};
