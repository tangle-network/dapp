import { useEffect } from 'react';

export const usePageLoadMetrics = (pageName: string) => {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Send to analytics
      console.debug(`${pageName} loaded in ${loadTime}ms`);
    };
  }, [pageName]);
};
