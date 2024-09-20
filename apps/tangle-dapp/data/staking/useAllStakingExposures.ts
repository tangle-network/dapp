import { Option, StorageKey, u32 } from '@polkadot/types';
import { AccountId32 } from '@polkadot/types/interfaces';
import { SpStakingPagedExposureMetadata } from '@polkadot/types/lookup';
import { useCallback, useMemo } from 'react';

import useApiRx from '../../hooks/useApiRx';
import { SubstrateAddress } from '../../types/utils';
import assertSubstrateAddress from '../../utils/assertSubstrateAddress';

export type StakingExposureEntry = {
  eraIndex: number;
  address: SubstrateAddress;
  metadata: SpStakingPagedExposureMetadata;
};

const useAllStakingExposures = (): {
  isLoading: boolean;
  error: Error | null;
  result: StakingExposureEntry[] | null;
} => {
  const { result: exposures, ...other } = useApiRx<
    [StorageKey<[u32, AccountId32]>, Option<SpStakingPagedExposureMetadata>][]
  >(
    useCallback((api) => {
      return api.query.staking.erasStakersOverview.entries();
    }, []),
  );

  const entriesAsTuples = useMemo(() => {
    if (exposures === null) {
      return null;
    }

    return exposures.flatMap(([key, value]) => {
      // Ignore empty values.
      if (value.isNone) {
        return [];
      }

      const eraIndex = key.args[0].toNumber();
      const address = assertSubstrateAddress(key.args[1].toString());

      return [[eraIndex, address, value.unwrap()] as const];
    });
  }, [exposures]);

  const entries = useMemo<StakingExposureEntry[] | null>(() => {
    if (entriesAsTuples === null) {
      return null;
    }

    return entriesAsTuples.map(([eraIndex, address, metadata]) => {
      return {
        eraIndex,
        address,
        metadata,
      } satisfies StakingExposureEntry;
    });
  }, [entriesAsTuples]);

  return {
    result: entries,
    ...other,
  };
};

export default useAllStakingExposures;
