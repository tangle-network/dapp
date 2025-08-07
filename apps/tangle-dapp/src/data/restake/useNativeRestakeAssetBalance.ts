import { BN, BN_ZERO } from '@polkadot/util';
import { NATIVE_ASSET_ID } from '@tangle-network/tangle-shared-ui/constants/restaking';
import useRestakeDelegatorInfo from '@tangle-network/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import { useCallback, useMemo } from 'react';
import useStakingLedger from '../staking/useStakingLedger';

const useNativeRestakeAssetBalance = (): BN | null => {
  const { result: delegatorInfo } = useRestakeDelegatorInfo();

  const { result: bondedInStaking } = useStakingLedger(
    useCallback((ledger) => ledger.active.toBn(), []),
  );

  const delegated = useMemo(() => {
    if (delegatorInfo === null) {
      return BN_ZERO;
    }

    return delegatorInfo.delegations
      .filter((item) => item.assetId === NATIVE_ASSET_ID && item.isNomination)
      .reduce(
        (acc, item) => acc.add(new BN(item.amountBonded.toString())),
        new BN(0),
      );
  }, [delegatorInfo]);

  const balance = useMemo(() => {
    if (bondedInStaking === null || bondedInStaking.value === null) {
      return null;
    }

    const nominatedBalance = bondedInStaking.value.sub(delegated);
    
    return nominatedBalance.isNeg() ? BN_ZERO : nominatedBalance;
  }, [bondedInStaking, delegated]);

  return balance;
};

export default useNativeRestakeAssetBalance;
