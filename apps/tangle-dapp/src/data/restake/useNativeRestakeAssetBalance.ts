import { BN } from '@polkadot/util';
import { NATIVE_ASSET_ID } from '@tangle-network/tangle-shared-ui/constants/restaking';
import useRestakeDelegatorInfo from '@tangle-network/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import { useMemo } from 'react';
import useBalancesLock from '../balances/useBalancesLock';
import { SubstrateLockId } from '../../constants';

const useNativeRestakeAssetBalance = (): BN | null => {
  const { delegatorInfo } = useRestakeDelegatorInfo();
  const stakingLock = useBalancesLock(SubstrateLockId.STAKING);

  const balance = useMemo(() => {
    if (delegatorInfo === null || stakingLock.amount === null) {
      return null;
    }

    const delegated = delegatorInfo.delegations
      .filter((item) => item.assetId === NATIVE_ASSET_ID)
      .reduce(
        (acc, item) => acc.add(new BN(item.amountBonded.toString())),
        new BN(0),
      );

    return stakingLock.amount.sub(delegated);
  }, [delegatorInfo, stakingLock.amount]);

  return balance;
};

export default useNativeRestakeAssetBalance;
