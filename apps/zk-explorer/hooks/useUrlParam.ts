import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export enum UrlParamKey {
  SearchQuery = 'q',
  PaginationPageNumber = 'page',
  Filters = 'filter',
}

export const useUrlParam = (
  key: UrlParamKey
): [string, (query: string | null) => void] => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    // Read the query parameter from the URL.
    const currentQuery = searchParams.get(key);

    if (currentQuery !== null) {
      setSearchQuery(currentQuery);
    }
  }, [searchParams, key]);

  const updateSearchQuery = (query: string | null) => {
    setSearchQuery(query ?? '');

    const updatedSearchParams = new URLSearchParams(window.location.search);

    if (query === null) {
      updatedSearchParams.delete(key);
    } else {
      updatedSearchParams.set(key, query);
    }

    const newUrl = `${window.location.pathname}?${updatedSearchParams}`;

    window.history.pushState({}, '', newUrl);
  };

  return [searchQuery, updateSearchQuery];
};
