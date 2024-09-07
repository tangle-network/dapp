import { BN, u8aToString } from '@polkadot/util';
import { useCallback, useMemo } from 'react';

import { LsPool, LsProtocolId } from '../../constants/liquidStaking/types';
import useApiRx from '../../hooks/useApiRx';
import useNetworkFeatures from '../../hooks/useNetworkFeatures';
import { NetworkFeature } from '../../types';
import assertSubstrateAddress from '../../utils/assertSubstrateAddress';
import permillToPercentage from '../../utils/permillToPercentage';

const useLsPools = (): Map<number, LsPool> | null | Error => {
  const networkFeatures = useNetworkFeatures();

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

    return rawBondedPools.flatMap(([key, valueOpt]) => {
      // Skip empty values.
      if (valueOpt.isNone) {
        return [];
      }

      const tanglePool = valueOpt.unwrap();

      // Ignore all non-open pools.
      if (!tanglePool.state.isOpen) {
        return [];
      }

      return [[key.args[0].toNumber(), tanglePool] as const];
    });
  }, [rawBondedPools]);

  const poolsMap = useMemo(() => {
    if (tanglePools === null) {
      return null;
    }

    const keyValuePairs = tanglePools.map(([id, tanglePool]) => {
      const metadataEntryBytes =
        rawMetadataEntries === null
          ? undefined
          : rawMetadataEntries.find(
              ([idKey]) => idKey.args[0].toNumber() === id,
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
        id,
        metadata,
        owner,
        commissionPercentage,
        // TODO: Dummy values.
        apyPercentage: 0.1,
        chainId: LsProtocolId.POLKADOT,
        totalStaked: new BN(1234560000000000),
        ownerStaked: new BN(12300003567),
        validators: [
          '5FfP4SU5jXY9ZVfR1kY1pUXuJ3G1bfjJoQDRz4p7wSH3Mmdn' as any,
          '5FnL9Pj3NX7E6yC1a2tN4kVdR7y2sAqG8vRsF4PN6yLeu2mL' as any,
          '5CF8H7P3qHfZzBtPXH6G6e3Wc3V2wVn6tQHgYJ5HGKK1eC5z' as any,
          '5GV8vP8Bh3fGZm2P7YNxMzUd9Wy4k3RSRvkq7RXVjxGGM1cy' as any,
          '5DPy4XU6nNV2t2NQkz3QvPB2X5GJ5ZJ1wqMzC4Rxn2WLbXVD' as any,
        ],
      };

      return [id, pool] as const;
    });

    return new Map(keyValuePairs);
  }, [rawMetadataEntries, tanglePools]);

  return poolsMap;
};

export default useLsPools;
