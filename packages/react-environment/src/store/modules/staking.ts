import { useEffect, useReducer } from 'react';
import { ApiRx } from '@polkadot/api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FixedPointNumber } from '@webb-tools/sdk-core';

import { useApi } from '@webb-dapp/react-hooks';

import { DerivedStakingPool } from '@webb-tools/api-derive';
import { StakingPool } from '@webb-tools/sdk-homa';

export type StakingPoolData = {
  stakingPool: StakingPool;
  derive: DerivedStakingPool;
};

type StakingAction = {
  type: 'update';
  value: {
    data: StakingPoolData;
  };
};

type StakingPoolState = {
  data: StakingPoolData | null;
}

const initState: StakingPoolState = {
  data: null
};

const reducer = (state: StakingPoolState, action: StakingAction): StakingPoolState => {
  switch (action.type) {
    case 'update': {
      return { data: action.value.data };
    }
  }
};

export const subscribeStakingPool = (api: ApiRx): Observable<StakingPoolData> => {
  const stakingPool$ = (api.derive as any).homa.stakingPool() as Observable<DerivedStakingPool>;

  return stakingPool$.pipe(
    map((data: DerivedStakingPool): StakingPoolData => {
      const stakingPool = new StakingPool({
        bondingDuration: data.bondingDuration.toNumber(),
        currentEra: data.currentEra.toNumber(),
        defaultExchangeRate: FixedPointNumber.fromInner(data.defaultExchangeRate.toString()),
        freeUnbonded: FixedPointNumber.fromInner(data.freeUnbonded.toString()),
        liquidTotalIssuance: FixedPointNumber.fromInner(data.liquidTokenIssuance.toString()),
        stakingPoolParams: {
          baseFeeRate: FixedPointNumber.fromInner(data.stakingPoolParams.baseFeeRate.toString()),
          targetMaxFreeUnbondedRatio: FixedPointNumber.fromInner(data.stakingPoolParams.targetMaxFreeUnbondedRatio.toString()),
          targetMinFreeUnbondedRatio: FixedPointNumber.fromInner(data.stakingPoolParams.targetMinFreeUnbondedRatio.toString()),
          targetUnbondingToFreeRatio: FixedPointNumber.fromInner(data.stakingPoolParams.targetUnbondingToFreeRatio.toString())
        },
        totalBonded: FixedPointNumber.fromInner(data.totalBonded.toString()),
        unbondNextEra: FixedPointNumber.fromInner(data.nextEraUnbond[0].toString()),
        unbondingToFree: FixedPointNumber.fromInner(data.unbondingToFree.toString())
      });

      return {
        derive: data,
        stakingPool: stakingPool
      };
    })
  );
};

export const useStakingStore = (): StakingPoolData | null => {
  const { api } = useApi();
  const [state, dispatch] = useReducer(reducer, initState);

  useEffect(() => {
    if (!api || !api.isConnected) return;

    const subscription1 = subscribeStakingPool(api).subscribe((result) => {
      dispatch({
        type: 'update',
        value: { data: result }
      });
    });

    return (): void => {
      subscription1.unsubscribe();
    };
  }, [api]);

  return state.data;
};
