import { Option, StorageKey, u32 } from '@polkadot/types';
import { AccountId32 } from '@polkadot/types/interfaces';
import { SpStakingPagedExposureMetadata } from '@polkadot/types/lookup';
import { useCallback } from 'react';

import useApiRx from '../../hooks/useApiRx';
import useEntryMap from '../../hooks/useEntryMap';
import useCurrentEra from './useCurrentEra';

const useStakingExposures = () => {
  // TODO: Also consider error from this hook.
  const { result: currentEra } = useCurrentEra();

  const { result: exposures, ...other } = useApiRx<
    [StorageKey<[u32, AccountId32]>, Option<SpStakingPagedExposureMetadata>][]
  >(
    useCallback(
      (api) => {
        if (currentEra === null) {
          return null;
        }
        return api.query.staking.erasStakersOverview.entries(currentEra);
      },
      [currentEra],
    ),
  );

  const exposureMap = useEntryMap(
    exposures,
    useCallback((key) => key.args[1].toString(), []),
  );

  return { result: exposureMap, ...other };
};

export default useStakingExposures;
