import useSubstrateAddress from '@tangle-network/tangle-shared-ui/hooks/useSubstrateAddress';
import { LsProtocolId } from '@tangle-network/tangle-shared-ui/types/liquidStaking';
import assert from 'assert';
import { useMemo } from 'react';

import { LsMyPoolRow } from '../../components/LiquidStaking/LsMyPoolsTable';
import useLsPools from './useLsPools';

const useLsMyPools = () => {
  const substrateAddress = useSubstrateAddress();
  const lsPools = useLsPools();

  const myPools: LsMyPoolRow[] | null = useMemo(() => {
    if (substrateAddress === null || !(lsPools instanceof Map)) {
      return null;
    }

    const lsPoolsArray = Array.from(lsPools.values());

    return lsPoolsArray
      .filter((lsPool) => lsPool.members.has(substrateAddress))
      .map((lsPool) => {
        const account = lsPool.members.get(substrateAddress);

        assert(account !== undefined);

        return {
          ...lsPool,
          myStake: account.balance.toBn(),
          isRoot: lsPool.ownerAddress === substrateAddress,
          isNominator: lsPool.nominatorAddress === substrateAddress,
          isBouncer: lsPool.bouncerAddress === substrateAddress,
          // TODO: Obtain which protocol this pool is associated with. For the parachain, there'd need to be some query to see what pools are associated with which parachain protocols. For Tangle networks, it's simply its own protocol. For now, using dummy data.
          lsProtocolId: LsProtocolId.TANGLE_LOCAL,
        } satisfies LsMyPoolRow;
      });
  }, [lsPools, substrateAddress]);

  return myPools;
};

export default useLsMyPools;
