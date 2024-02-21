import { useSearchParams } from 'next/navigation';
import { z } from 'zod';

import {
  DelegationsAndPayoutsTab,
  PagePath,
  QueryParamKey,
  QueryParamKeyOf,
  QueryParamValueOf,
} from '../types';

type UseQueryParamsReturn<Page extends PagePath> = {
  value: QueryParamValueOf<QueryParamKeyOf<Page>> | null;
};

function validateQueryParam(
  key: QueryParamKey,
  value: string | null
): value is QueryParamValueOf<typeof key> {
  // Not defined in the query params, so it's valid.
  if (value === null) {
    return false;
  }

  switch (key) {
    case QueryParamKey.DelegationsAndPayoutsTab:
      return z.nativeEnum(DelegationsAndPayoutsTab).safeParse(value).success;
  }
}

const useQueryParamKey = <Page extends PagePath>(
  key: QueryParamKeyOf<Page>
): UseQueryParamsReturn<Page> => {
  const queryParams = useSearchParams();
  const value = queryParams.get(key);

  return {
    value: validateQueryParam(key, value) ? value : null,
  };
};

export default useQueryParamKey;
