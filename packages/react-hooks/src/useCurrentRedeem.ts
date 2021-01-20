import { useState, useEffect, useCallback, useMemo } from 'react';
import { interval, Observable } from 'rxjs';
import { switchMap, map, startWith, take } from 'rxjs/operators';

import { FixedPointNumber } from '@acala-network/sdk-core';
import { Balance } from '@acala-network/types/interfaces/runtime';
import { Codec } from '@polkadot/types/types';

import { useAccounts } from './useAccounts';
import { useApi } from './useApi';

export function useCurrentRedeem (): { currentRedeem: FixedPointNumber; query: () => void } {
  const { api } = useApi();
  const { active } = useAccounts();
  const [currentRedeem, setCurrentRedeem] = useState<FixedPointNumber>(FixedPointNumber.ZERO);

  const query = useCallback(() => {
    if (!api || !active) return;

    ((api.rpc as any).stakingPool.getAvailableUnbonded(active.address) as Observable<Codec>).pipe(
      map((result) => {
        if (result.isEmpty) return null;

        return result as unknown as { amount: Balance };
      }),
      map((result) => {
        return FixedPointNumber.fromInner(result?.amount.toString() || 0);
      }),
      take(1)
    ).subscribe(setCurrentRedeem);
  }, [api, active]);

  useEffect(() => {
    if (!api || !active) return;

    const subscriber = interval(1000 * 60).pipe(
      startWith(0),
      switchMap(() => (api.rpc as any).stakingPool.getAvailableUnbonded(active.address) as Observable<Codec>),
      map((result) => {
        if (result.isEmpty) return null;

        return result as unknown as { amount: Balance };
      }),
      map((result) => {
        return FixedPointNumber.fromInner(result?.amount.toString() || 0);
      })
    ).subscribe(setCurrentRedeem);

    return (): void => subscriber.unsubscribe();
  }, [api, active]);

  const result = useMemo(() => {
    return {
      currentRedeem,
      query
    };
  }, [query, currentRedeem]);

  return result;
}
