import { useEffect, useState } from 'react';

export const useFetch = (url: RequestInfo) => {
  const [data, setData] = useState(null);

  // empty array as second argument equivalent to componentDidMount
  useEffect(() => {
    async function fetchData() {
      console.log('Url', url);
      const response = await fetch(url);

      console.log(response);
      const json = await response.json();

      setData(json);
    }

    fetchData();
  }, [url]);

  return data;
};
