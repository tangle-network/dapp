import { useMemo } from 'react';
import { StorageKey } from '@polkadot/types';
import { Share, Balance, CurrencyId } from '@acala-network/types/interfaces';
import { PoolInfo } from '@open-web3/orml-types/interfaces';
import { FixedPointNumber } from '@acala-network/sdk-core';

import { useCall } from './useCall';
import { useApi } from './useApi';
import { useAccounts } from './useAccounts';

interface CPoolInfo {
  totalShares: FixedPointNumber;
  totalRewards: FixedPointNumber;
  totalWithdrawnRewards: FixedPointNumber;
}

export type PoolId = 'Loans' | 'DexIncentive' | 'DexSaving' | 'Homa';

export function getPoolId (poolId: PoolId, currency: CurrencyId): Partial<Record<PoolId, CurrencyId>> | 'Homa' {
  if (poolId === 'Loans') {
    return {
      Loans: currency
    };
  }

  if (poolId === 'DexIncentive') {
    return {
      DexIncentive: currency
    };
  }

  if (poolId === 'DexSaving') {
    return {
      DexSaving: currency
    };
  }

  return 'Homa';
}

export const useIncentivePool = (poolId: PoolId, currency: CurrencyId): CPoolInfo => {
  const poolInfo = useCall<PoolInfo>('query.rewards.pools', [getPoolId(poolId, currency)]);
  const result = useMemo<CPoolInfo>(() => {
    if (!poolInfo) {
      return {
        totalRewards: FixedPointNumber.ZERO,
        totalShares: FixedPointNumber.ZERO,
        totalWithdrawnRewards: FixedPointNumber.ZERO
      };
    }

    return {
      totalRewards: FixedPointNumber.fromInner(poolInfo.totalRewards.toString()),
      totalShares: FixedPointNumber.fromInner(poolInfo.totalShares.toString()),
      totalWithdrawnRewards: FixedPointNumber.fromInner(poolInfo.totalWithdrawnRewards.toString())
    };
  }, [poolInfo]);

  return result;
};

interface ShareAndWithdrawn {
  share: FixedPointNumber;
  withdrawn: FixedPointNumber;
}

export const useShareAndWithdrawnReward = (poolId: PoolId, currency: CurrencyId, account?: string): ShareAndWithdrawn => {
  const info = useCall<[Share, Balance]>('query.rewards.shareAndWithdrawnReward', [getPoolId(poolId, currency), account]);
  const result = useMemo<ShareAndWithdrawn>(() => {
    if (!info) {
      return {
        share: FixedPointNumber.ZERO,
        withdrawn: FixedPointNumber.ZERO
      };
    }

    return {
      share: FixedPointNumber.fromInner(info[0].toString()),
      withdrawn: FixedPointNumber.fromInner(info[1].toString())
    };
  }, [info]);

  return result;
};

interface RewardPool {
  currency: CurrencyId;
  reward: FixedPointNumber;
}

// get currency active LP whic is have incentive reward
export const useDexActiveIncentiveRewardPool = (): RewardPool[] => {
  const { api } = useApi();
  const dexIncentiveRewards = useCall<[StorageKey, Balance][]>('query.incentives.dEXIncentiveRewards.entries');
  const result = useMemo(() => {
    if (!dexIncentiveRewards) return [];

    return dexIncentiveRewards.map((item) => {
      return {
        currency: api.createType('CurrencyId' as any, (item[0].toHuman() as unknown as any[])[0]) as CurrencyId,
        reward: FixedPointNumber.fromInner(item[1].toString())
      };
    }).filter((item) => !item.reward.isZero());
  }, [api, dexIncentiveRewards]);

  return result;
};

interface IncentiveParams {
  currency: CurrencyId;
  accumulatePeriod: number;
}

export const useIncentiveRewardParams = (): IncentiveParams => {
  const { api } = useApi();
  const accumulatePeriod = api.consts.incentives.accumulatePeriod;
  const currency = api.consts.incentives.incentiveCurrencyId as unknown as CurrencyId;

  const result = useMemo(() => {
    return {
      accumulatePeriod: Number(accumulatePeriod.toString()),
      currency
    };
  }, [currency, accumulatePeriod]);

  return result;
};

// get total dex incentive reward information
export const useDexIncentiveReward = (): { params: IncentiveParams; rewardPool: RewardPool[] } => {
  const params = useIncentiveRewardParams();
  const rewardPool = useDexActiveIncentiveRewardPool();

  return {
    params,
    rewardPool
  };
};

// get currency active LP whic is have incentive reward
export const useLoanActiveIncentiveRewardPool = (): RewardPool[] => {
  const { api } = useApi();
  const loansIncentiveRewards = useCall<[StorageKey, Balance][]>('query.incentives.loansIncentiveRewards.entries');
  const result = useMemo(() => {
    if (!loansIncentiveRewards) return [];

    return loansIncentiveRewards.map((item) => {
      return {
        currency: api.createType('CurrencyId' as any, (item[0].toHuman() as unknown as any[])[0]) as CurrencyId,
        reward: FixedPointNumber.fromInner(item[1].toString())
      };
    }).filter((item) => !item.reward.isZero());
  }, [api, loansIncentiveRewards]);

  return result;
};

// get total dex incentive reward information
export const useLoansIncentiveReward = (): { params: IncentiveParams; rewardPool: RewardPool[] } => {
  const params = useIncentiveRewardParams();
  const rewardPool = useLoanActiveIncentiveRewardPool();

  return {
    params,
    rewardPool
  };
};

interface IncentiveShare {
  ratio: FixedPointNumber;
  reward: FixedPointNumber;
  share: FixedPointNumber;
  totalReward: FixedPointNumber;
  totalShare: FixedPointNumber;
}

export const useIncentiveShare = (poolId: PoolId, currency: CurrencyId, account?: string): IncentiveShare => {
  const { active } = useAccounts();
  const _account = account || (active ? active.address : '');
  const poolInfo = useIncentivePool(poolId, currency);
  const shares = useShareAndWithdrawnReward(poolId, currency, _account);

  const result = useMemo(() => {
    const ratio = shares.share.div(poolInfo.totalShares);
    const reward = poolInfo.totalRewards.times(ratio).minus(shares.withdrawn);

    return {
      ratio,
      reward: reward.isLessThan(FixedPointNumber.ZERO) ? FixedPointNumber.ZERO : reward,
      share: shares.share,
      totalReward: poolInfo.totalRewards.minus(poolInfo.totalWithdrawnRewards),
      totalShare: poolInfo.totalShares
    };
  }, [poolInfo, shares]);

  return result;
};
