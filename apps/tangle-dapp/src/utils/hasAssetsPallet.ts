import { ApiBase } from '@polkadot/api/base';
import {
  ApiTypes,
  AugmentedQueries,
  AugmentedSubmittables,
} from '@polkadot/api/types';
import has from 'lodash/has';

function hasAssetsPallet<
  TApiTypes extends ApiTypes,
  Type extends 'tx' | 'query',
  Method extends Type extends 'query'
    ? keyof AugmentedQueries<TApiTypes>['assets']
    : keyof AugmentedSubmittables<TApiTypes>['assets'],
>(api: ApiBase<TApiTypes>, type: Type, methods?: Method | Method[]): boolean {
  if (Array.isArray(methods)) {
    return methods.every((method) => has(api[type].assets, method));
  } else if (typeof methods === 'string') {
    return has(api[type].assets, methods);
  }

  return Boolean(api[type]);
}

export default hasAssetsPallet;
