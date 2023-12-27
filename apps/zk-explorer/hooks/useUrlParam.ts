import { useEffect, useState } from 'react';

export enum UrlParamKey {
  SearchQuery = 'q',
  PaginationPageNumber = 'page',
  Filters = 'filters',
}

export const useUrlParam = (
  key: UrlParamKey
): [string | null, (value: string | null) => void] => {
  const [urlParam, setUrlParam] = useState<string | null>(null);

  useEffect(() => {
    const handleUrlChange = () => {
      const newQuery = new URLSearchParams(window.location.search).get(key);

      console.log(key, newQuery);

      if (urlParam !== newQuery) {
        console.log('setUrlParam', newQuery);
        setUrlParam(newQuery);
      }
    };

    // Listen for URL changes.
    window.addEventListener('popstate', handleUrlChange);

    // Perform initial check.
    handleUrlChange();

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [key, urlParam]);

  const updateUrlParam = (value: string | null) => {
    if (value !== urlParam) {
      const updatedSearchParams = new URLSearchParams(window.location.search);

      if (value === null) {
        updatedSearchParams.delete(key);
      } else {
        updatedSearchParams.set(key, value);
      }

      const newUrl = `${window.location.pathname}?${updatedSearchParams}`;

      window.history.pushState({}, '', newUrl);

      setUrlParam(value);
    }
  };

  return [urlParam, updateUrlParam];
};
