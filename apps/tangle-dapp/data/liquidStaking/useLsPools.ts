import { BN_ZERO } from '@polkadot/util';
import { useMemo } from 'react';

import { LsPool } from '../../constants/liquidStaking/types';
import useNetworkFeatures from '../../hooks/useNetworkFeatures';
import { NetworkFeature } from '../../types';
import assertSubstrateAddress from '../../utils/assertSubstrateAddress';
import permillToPercentage from '../../utils/permillToPercentage';
import useLsPoolCompoundApys from './apy/useLsPoolCompoundApys';
import useLsBondedPools from './useLsBondedPools';
import useLsPoolMembers from './useLsPoolMembers';
import useLsPoolNominations from './useLsPoolNominations';
import useLsPoolsMetadata from './useLsPoolsMetadata';

const useLsPools = (): Map<number, LsPool> | null | Error => {
  const networkFeatures = useNetworkFeatures();
  const poolNominations = useLsPoolNominations();
  const isSupported = networkFeatures.includes(NetworkFeature.LsPools);

  const metadatas = useLsPoolsMetadata();
  const bondedPools = useLsBondedPools();
  const poolMembers = useLsPoolMembers();
  const compoundApys = useLsPoolCompoundApys();

  const poolsMap = useMemo(() => {
    if (
      bondedPools === null ||
      poolNominations === null ||
      compoundApys === null ||
      poolMembers === null ||
      metadatas === null ||
      !isSupported
    ) {
      return null;
    }

    const keyValuePairs = bondedPools.map(([poolId, tanglePool]) => {
      const metadata = metadatas.get(poolId);

      // TODO: `tanglePool.metadata.name` should be available based on the latest changes to Tangle. Need to regenerate the types. Might want to prefer that method vs. the metadata query.

      // Roles can be `None` if updated and removed.
      const ownerAddress = tanglePool.roles.root.isNone
        ? undefined
        : assertSubstrateAddress(tanglePool.roles.root.unwrap().toString());

      const nominatorAddress = tanglePool.roles.nominator.isNone
        ? undefined
        : assertSubstrateAddress(
            tanglePool.roles.nominator.unwrap().toString(),
          );

      const bouncerAddress = tanglePool.roles.bouncer.isNone
        ? undefined
        : assertSubstrateAddress(tanglePool.roles.bouncer.unwrap().toString());

      const memberBalances = poolMembers.filter(([id]) => {
        return id === poolId;
      });

      const totalStaked = memberBalances.reduce((acc, [, , account]) => {
        return acc.add(account.balance.toBn());
      }, BN_ZERO);

      const commissionPercentage = tanglePool.commission.current.isNone
        ? undefined
        : permillToPercentage(tanglePool.commission.current.unwrap()[0]);

      const validators = poolNominations.get(poolId) ?? [];
      const apyEntry = compoundApys.get(poolId);

      // TODO: Losing precision here by fixing it to two decimal places. Should be handling this instead on the UI side, not on this data fetching hook?
      const apyPercentage =
        apyEntry === undefined ? undefined : Number(apyEntry.toFixed(2));

      const membersKeyValuePairs = poolMembers.map(
        ([, address, account]) => [address, account] as const,
      );

      const membersMap = new Map(membersKeyValuePairs);

      const pool: LsPool = {
        id: poolId,
        metadata,
        ownerAddress,
        nominatorAddress,
        bouncerAddress,
        commissionPercentage,
        validators,
        totalStaked,
        apyPercentage,
        members: membersMap,
      };

      return [poolId, pool] as const;
    });

    return new Map(keyValuePairs);
  }, [
    bondedPools,
    poolNominations,
    compoundApys,
    poolMembers,
    metadatas,
    isSupported,
  ]);

  // In case that the user connects to testnet or mainnet, but the network
  // doesn't have the liquid staking pools feature.
  if (!isSupported) {
    return new Error(
      'Liquid staking pools are not yet supported on this network. Please try connecting to a different network that supports liquid staking pools.',
    );
  }

  return poolsMap;
};

export default useLsPools;
