import { BN_ZERO } from '@polkadot/util';
import assertSubstrateAddress from '@tangle-network/ui-components/utils/assertSubstrateAddress';
import { useMemo } from 'react';

import { LsPool } from '../../constants/liquidStaking/types';
import useNetworkFeatures from '../../hooks/useNetworkFeatures';
import { NetworkFeature } from '../../types';
import perbillToFractional from '../../utils/perbillToFractional';
import useLsPoolCompoundApys from './apy/useLsPoolCompoundApys';
import useLsBondedPools from './useLsBondedPools';
import useAssetAccounts from './useAssetAccounts';
import useLsPoolNominations from './useLsPoolNominations';
import { toSubstrateAddress } from '@tangle-network/ui-components';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';

const useLsPools = (): Map<number, LsPool> | null | Error => {
  const networkFeatures = useNetworkFeatures();
  const poolNominations = useLsPoolNominations();
  const bondedPools = useLsBondedPools();
  const poolMembers = useAssetAccounts();
  const compoundApys = useLsPoolCompoundApys();
  const ss58Prefix = useNetworkStore((store) => store.network2?.ss58Prefix);

  const isSupported = networkFeatures.includes(NetworkFeature.LsPools);

  const poolsMap = useMemo(() => {
    if (
      bondedPools === null ||
      poolNominations === null ||
      compoundApys === null ||
      poolMembers === null ||
      !isSupported
    ) {
      return null;
    }

    const keyValuePairs = bondedPools.map(([poolId, tanglePool]) => {
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

      const memberBalances = poolMembers.filter(([id]) => id === poolId);

      const totalStaked = memberBalances.reduce(
        (acc, [, , account]) => acc.add(account.balance.toBn()),
        BN_ZERO,
      );

      const commissionFractional = tanglePool.commission.current.isNone
        ? undefined
        : perbillToFractional(tanglePool.commission.current.unwrap()[0]);

      const validators = poolNominations.get(poolId) ?? [];
      const apyEntry = compoundApys.get(poolId);

      // TODO: Losing precision here by fixing it to two decimal places. Should be handling this instead on the UI side, not on this data fetching hook?
      const apyPercentage =
        apyEntry === undefined ? undefined : Number(apyEntry.toFixed(2));

      const membersKeyValuePairs = poolMembers
        .filter(([memberPoolId]) => memberPoolId === poolId)
        .map(
          ([, address, account]) =>
            // Encode addresses with the active network's SS58 prefix to prevent
            // address comparison bugs.
            [toSubstrateAddress(address, ss58Prefix), account] as const,
        );

      const membersMap = new Map(membersKeyValuePairs);

      const name = tanglePool.metadata.name.isNone
        ? 'Pool'
        : tanglePool.metadata.name.unwrap().toUtf8();

      const iconUrl = tanglePool.metadata.icon.isNone
        ? undefined
        : tanglePool.metadata.icon.unwrap().toUtf8();

      const pool: LsPool = {
        id: poolId,
        name,
        commissionFractional,
        validators,
        totalStaked,
        apyPercentage,
        members: membersMap,
        iconUrl: iconUrl?.trim() === '' ? undefined : iconUrl,
        state: tanglePool.state.type,
        // Encode addresses with the active network's SS58 prefix to prevent
        // address comparison bugs.
        ownerAddress:
          ownerAddress === undefined
            ? undefined
            : toSubstrateAddress(ownerAddress, ss58Prefix),
        nominatorAddress:
          nominatorAddress === undefined
            ? undefined
            : toSubstrateAddress(nominatorAddress, ss58Prefix),
        bouncerAddress:
          bouncerAddress === undefined
            ? undefined
            : toSubstrateAddress(bouncerAddress, ss58Prefix),
      };

      return [poolId, pool] as const;
    });

    return new Map(keyValuePairs);
  }, [
    bondedPools,
    poolNominations,
    compoundApys,
    poolMembers,
    isSupported,
    ss58Prefix,
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
