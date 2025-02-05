import { useSearchParams } from 'react-router';
import { z } from 'zod';

import {
  DelegationsAndPayoutsTab,
  PagePath,
  QueryParamKey,
  QueryParamKeyOf,
  QueryParamValueOf,
} from '../types';
import { isEvmAddress, isTemplateBigInt } from '@webb-tools/webb-ui-components';

type UseQueryParamsReturn<Page extends PagePath> = {
  value: QueryParamValueOf<QueryParamKeyOf<Page>> | null;
};

function validateQueryParam(
  key: QueryParamKey,
  value: string | null,
): value is QueryParamValueOf<typeof key> {
  // Not defined in the query params, so it's valid.
  if (value === null) {
    return false;
  }

  switch (key) {
    case QueryParamKey.DELEGATIONS_AND_PAYOUTS_TAB:
      return z.nativeEnum(DelegationsAndPayoutsTab).safeParse(value).success;
    case QueryParamKey.RESTAKE_OPERATOR:
    case QueryParamKey.RESTAKE_VAULT:
      return z.string().safeParse(value).success;
    case QueryParamKey.RESTAKE_ASSET_ID:
      return isEvmAddress(value) || isTemplateBigInt(value);
  }
}

const useQueryParamKey = <Page extends PagePath>(
  key: QueryParamKeyOf<Page>,
): UseQueryParamsReturn<Page> => {
  const [searchParams] = useSearchParams();
  const value = searchParams.get(key);

  return {
    value: validateQueryParam(key, value) ? value : null,
  };
};

export default useQueryParamKey;
