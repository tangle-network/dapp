import { DeriveStakingQuery } from '@polkadot/api-derive/staking/types';
import {
  SpStakingExposurePage,
  SpStakingPagedExposureMetadata,
} from '@polkadot/types/lookup';
import {
  DEFAULT_FLAGS_ELECTED,
  DEFAULT_FLAGS_WAITING,
} from '@tangle-network/dapp-config/constants/tangle';
import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import { useCallback, useMemo } from 'react';
import { map, Observable } from 'rxjs';

export type ExposureMapEntry = {
  exposure: SpStakingExposurePage | null;
  exposureMeta: SpStakingPagedExposureMetadata | null;
};

const useValidatorStakingExposures = (isActive: boolean) => {
  const { result: queryResults, ...other } = useApiRx(
    useCallback(
      (api) => {
        const deriveObservable: Observable<{ info: DeriveStakingQuery[] }> =
          isActive
            ? api.derive.staking.electedInfo(DEFAULT_FLAGS_ELECTED)
            : api.derive.staking.waitingInfo(DEFAULT_FLAGS_WAITING);

        return deriveObservable.pipe(map((derive) => derive.info));
      },
      [isActive],
    ),
  );

  const exposureMap = useMemo(() => {
    if (queryResults === null) {
      return null;
    }

    const resultingMap = new Map<string, ExposureMapEntry>();

    for (const { accountId, exposureMeta, exposurePaged } of queryResults) {
      const exposure = exposurePaged.isSome && exposurePaged.unwrap();
      const expMeta = exposureMeta.isSome && exposureMeta.unwrap();

      resultingMap.set(accountId.toString(), {
        exposure: exposure || null,
        exposureMeta: expMeta || null,
      });
    }

    return resultingMap;
  }, [queryResults]);

  return { result: exposureMap, ...other };
};

export default useValidatorStakingExposures;
