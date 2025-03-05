import { BN, BN_ZERO } from '@polkadot/util';
import { NATIVE_ASSET_ID } from '@tangle-network/tangle-shared-ui/constants/restaking';
import useRestakeDelegatorInfo from '@tangle-network/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import { useMemo } from 'react';
import useBalancesLock from '../balances/useBalancesLock';
import { SubstrateLockId } from '../../constants';

const useNativeRestakeAssetBalance = (): BN | null => {
  const { delegatorInfo } = useRestakeDelegatorInfo();
  const stakingLock = useBalancesLock(SubstrateLockId.STAKING);

  const delegated = useMemo(() => {
    if (delegatorInfo === null) {
      return BN_ZERO;
    }

    return delegatorInfo.delegations
      .filter((item) => item.assetId === NATIVE_ASSET_ID)
      .reduce(
        (acc, item) => acc.add(new BN(item.amountBonded.toString())),
        new BN(0),
      );
  }, [delegatorInfo]);

  const balance = useMemo(() => {
    if (stakingLock.amount === null) {
      return null;
    }

    return stakingLock.amount.sub(delegated);
  }, [delegated, stakingLock.amount]);

  return balance;
};

export default useNativeRestakeAssetBalance;
