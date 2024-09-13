import { BN_ZERO, u8aToString } from '@polkadot/util';
import { useCallback, useMemo } from 'react';

import { LsPool } from '../../constants/liquidStaking/types';
import useApiRx from '../../hooks/useApiRx';
import useNetworkFeatures from '../../hooks/useNetworkFeatures';
import { NetworkFeature } from '../../types';
import assertSubstrateAddress from '../../utils/assertSubstrateAddress';
import permillToPercentage from '../../utils/permillToPercentage';
import useLsPoolCompoundApys from './apy/useLsPoolCompoundApys';
import useLsBondedPools from './useLsBondedPools';
import useLsPoolMembers from './useLsPoolMembers';
import useLsPoolNominations from './useLsPoolNominations';

const useLsPools = (): Map<number, LsPool> | null | Error => {
  const networkFeatures = useNetworkFeatures();
  const poolNominations = useLsPoolNominations();
  const isSupported = networkFeatures.includes(NetworkFeature.LsPools);

  const { result: rawMetadataEntries } = useApiRx(
    useCallback(
      (api) => {
        if (!isSupported) {
          return null;
        }

        return api.query.lst.metadata.entries();
      },
      [isSupported],
    ),
  );

  const bondedPools = useLsBondedPools();
  const poolMembers = useLsPoolMembers();
  const compoundApys = useLsPoolCompoundApys();

  const poolsMap = useMemo(() => {
    if (
      bondedPools === null ||
      poolNominations === null ||
      compoundApys === null ||
      !isSupported
    ) {
      return null;
    }

    const keyValuePairs = bondedPools.map(([poolId, tanglePool]) => {
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

      const ownerStake =
        poolMembers
          ?.find(([id, memberAddress]) => {
            return id === poolId && memberAddress === owner;
          })?.[2]
          .balance.toBn() ?? BN_ZERO;

      const memberBalances = poolMembers?.filter(([id]) => {
        return id === poolId;
      });

      const totalStaked =
        memberBalances?.reduce((acc, [, , account]) => {
          return acc.add(account.balance.toBn());
        }, BN_ZERO) ?? BN_ZERO;

      const commissionPercentage = tanglePool.commission.current.isNone
        ? undefined
        : permillToPercentage(tanglePool.commission.current.unwrap()[0]);

      const validators = poolNominations.get(poolId) ?? [];
      const apyEntry = compoundApys.get(poolId);

      const apyPercentage =
        apyEntry === undefined ? undefined : Number(apyEntry.toFixed(2));

      const pool: LsPool = {
        id: poolId,
        metadata,
        owner,
        commissionPercentage,
        validators,
        totalStaked,
        ownerStake,
        apyPercentage,
      };

      return [poolId, pool] as const;
    });

    return new Map(keyValuePairs);
  }, [
    bondedPools,
    poolNominations,
    compoundApys,
    isSupported,
    rawMetadataEntries,
    poolMembers,
  ]);

  // In case that the user connects to testnet or mainnet, but the network
  // doesn't have the liquid staking pools feature.
  if (!isSupported) {
    return new Error(
      'Liquid staking pools are not yet supported on this network.',
    );
  }

  return poolsMap;
};

export default useLsPools;
