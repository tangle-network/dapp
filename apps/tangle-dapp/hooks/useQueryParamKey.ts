import { useSearchParams } from 'next/navigation';
import { z } from 'zod';

import { DelegationsAndPayoutsTab } from '../containers/DelegationsPayoutsContainer/DelegationsPayoutsContainer';
import { PagePath } from '../types';

export enum QueryParamKey {
  DelegationsAndPayoutsTab = 'tab',
}

export type QueryParamKeyOf<Page extends PagePath> =
  Page extends PagePath.Nomination
    ? QueryParamKey.DelegationsAndPayoutsTab
    : never;

export type QueryParamValueOf<Key extends QueryParamKey> =
  Key extends QueryParamKey.DelegationsAndPayoutsTab
    ? DelegationsAndPayoutsTab
    : never;

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
