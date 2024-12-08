import type { ApiBase } from '@polkadot/api/base';
import type { ApiTypes, AugmentedQueries } from '@polkadot/api/types';
import type { MapKnownKeys } from '@webb-tools/dapp-types/utils/types';
import has from 'lodash/has';

function hasQuery<
  TApiTypes extends ApiTypes,
  Module extends keyof AugmentedQueries<TApiTypes>,
  Method extends keyof MapKnownKeys<AugmentedQueries<TApiTypes>[Module]>,
>(
  api: ApiBase<TApiTypes>,
  module: Module,
  methods?: Method | Method[],
): boolean {
  if (Array.isArray(methods)) {
    return methods.every((method) => has(api.query, [module, method]));
  } else if (typeof methods === 'string') {
    return has(api.query, [module, methods]);
  }

  return has(api.query, module);
}

export default hasQuery;
