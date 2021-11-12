import { LoggerService } from '@webb-tools/app-util';
import { useEffect, useState } from 'react';

export const useFetch = (url: RequestInfo, initialValue: any) => {
  const [data, setData] = useState(initialValue);

  // empty array as second argument equivalent to componentDidMount
  useEffect(() => {
    const controller = new AbortController();
    const logger = LoggerService.get('App');

    async function fetchData() {
      try {
        const response = await fetch(url, { signal: controller.signal });
        const json = await response.json();
        logger.trace(`Got data for url ${url}`, json);
        setData(json);
      } catch (e) {
        logger.error(e);
        setData({ error: true });
      }
    }

    fetchData();
    // Aborting the Request if the component is unmounted before Resolving
    return () => {
      controller.abort();
    };
  }, [url]);

  return data;
};
