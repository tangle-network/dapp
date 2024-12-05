import { ApiRx } from '@polkadot/api';
import type {
  DeriveStakingElected,
  DeriveStakingWaiting,
} from '@polkadot/api-derive/types';
import {
  SpStakingExposurePage,
  SpStakingPagedExposureMetadata,
} from '@polkadot/types/lookup';

import { ExposureMap } from '../types';

export function getExposureMap(
  api: ApiRx,
  derive: DeriveStakingElected | DeriveStakingWaiting,
): ExposureMap {
  const emptyExposure = api.createType<SpStakingExposurePage>(
    'SpStakingExposurePage',
  );

  const emptyExposureMeta = api.createType<SpStakingPagedExposureMetadata>(
    'SpStakingPagedExposureMetadata',
  );

  return derive.info.reduce(
    (exposureMap, { accountId, exposureMeta, exposurePaged }) => {
      const exp = exposurePaged.isSome && exposurePaged.unwrap();
      const expMeta = exposureMeta.isSome && exposureMeta.unwrap();

      exposureMap[accountId.toString()] = {
        exposure: exp || emptyExposure,
        exposureMeta: expMeta || emptyExposureMeta,
      };

      return exposureMap;
    },
    {} as Record<
      string,
      {
        exposure: SpStakingExposurePage;
        exposureMeta: SpStakingPagedExposureMetadata;
      }
    >,
  );
}
