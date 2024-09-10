import { BN, u8aToString } from '@polkadot/util';
import { useCallback, useMemo } from 'react';

import { LsPool } from '../../constants/liquidStaking/types';
import useApiRx from '../../hooks/useApiRx';
import useNetworkFeatures from '../../hooks/useNetworkFeatures';
import { NetworkFeature } from '../../types';
import assertSubstrateAddress from '../../utils/assertSubstrateAddress';
import permillToPercentage from '../../utils/permillToPercentage';
import useLsPoolNominations from './useLsPoolNominations';

const useLsPools = (): Map<number, LsPool> | null | Error => {
  const networkFeatures = useNetworkFeatures();
  const poolNominations = useLsPoolNominations();

  if (!networkFeatures.includes(NetworkFeature.LsPools)) {
    // TODO: Handle case where the active network doesn't support liquid staking pools.
  }

  const { result: rawMetadataEntries } = useApiRx(
    useCallback((api) => {
      return api.query.lst.metadata.entries();
    }, []),
  );

  const { result: rawBondedPools } = useApiRx(
    useCallback((api) => {
      return api.query.lst.bondedPools.entries();
    }, []),
  );

  const tanglePools = useMemo(() => {
    if (rawBondedPools === null) {
      return null;
    }

    return rawBondedPools.flatMap(([poolIdKey, valueOpt]) => {
      // Skip empty values.
      if (valueOpt.isNone) {
        return [];
      }

      const tanglePool = valueOpt.unwrap();

      // Ignore all non-open pools.
      if (!tanglePool.state.isOpen) {
        return [];
      }

      return [[poolIdKey.args[0].toNumber(), tanglePool] as const];
    });
  }, [rawBondedPools]);

  const poolsMap = useMemo(() => {
    if (tanglePools === null || poolNominations === null) {
      return null;
    }

    const keyValuePairs = tanglePools.map(([poolId, tanglePool]) => {
      const metadataEntryBytes =
        rawMetadataEntries === null
          ? undefined
          : rawMetadataEntries.find(
              ([idKey]) => idKey.args[0].toNumber() === poolId,
            )?.[1];

      const metadata =
        metadataEntryBytes === undefined
          ? undefined
          : u8aToString(metadataEntryBytes);

      // TODO: Under what circumstances would this be `None`? During pool creation, the various addresses seem required, not optional.
      const owner = assertSubstrateAddress(
        tanglePool.roles.root.unwrap().toString(),
      );

      const commissionPercentage = tanglePool.commission.current.isNone
        ? undefined
        : permillToPercentage(tanglePool.commission.current.unwrap()[0]);

      const pool: LsPool = {
        id: poolId,
        metadata,
        owner,
        commissionPercentage,
        validators: poolNominations.get(poolId) ?? [],
        // TODO: Dummy values.
        apyPercentage: 0.1,
        totalStaked: new BN(1234560000000000),
        ownerStake: new BN(12300003567),
      };

      return [poolId, pool] as const;
    });

    return new Map(keyValuePairs);
  }, [poolNominations, rawMetadataEntries, tanglePools]);

  return poolsMap;
};

export default useLsPools;
