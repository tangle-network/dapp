import type { ApiBase } from '@polkadot/api/base';
import type { ApiTypes, AugmentedConsts } from '@polkadot/api/types';
import type { MapKnownKeys } from '@webb-tools/dapp-types/utils/types';
import has from 'lodash/has';

export default function getModuleConstant<
  TApiType extends ApiTypes,
  TModule extends keyof AugmentedConsts<TApiType>,
  TConst extends keyof MapKnownKeys<AugmentedConsts<TApiType>[TModule]>,
  R extends ApiBase<TApiType>['consts'][TModule][TConst],
  TDefault = null,
>(
  api: ApiBase<TApiType>,
  module: TModule,
  constant: TConst,
  defaultValue: TDefault = null as TDefault,
): R | TDefault {
  return has(api.consts, [module, constant])
    ? (api.consts[module][constant] as R | TDefault)
    : (defaultValue as R | TDefault);
}
