import { ApiRx } from '@polkadot/api';
import { AccountId } from '@polkadot/types/interfaces';
import { useCallback, useMemo } from 'react';
import { map, Observable } from 'rxjs';
import useSWR from 'swr';

import { SwrBaseKey } from '../../constants';
import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import { Validator } from '../../types';
import {
  formatTokenBalance,
  getPolkadotApiPromise,
  getTotalNumberOfNominators,
  getValidatorCommission,
  getValidatorIdentity,
} from '../../utils/polkadot';
import useCurrentEra from '../staking/useCurrentEra';

type ValidatorObservableFactory = (api: ApiRx) => Observable<AccountId[]>;

export const waitingValidatorFactory: ValidatorObservableFactory = (api) =>
  api.derive.staking
    .waitingInfo()
    .pipe(
      map((waiting) => waiting.info.map((validator) => validator.accountId))
    );

export const activeValidatorFactory: ValidatorObservableFactory = (api) =>
  api.query.session.validators();

// TODO: This can be optimized even further by utilizing local storage as a another caching layer. Would be good to abstract that logic away by using some intermediate utility hook for local storage caching.
const useValidators = (
  status: 'Active' | 'Waiting',
  pageIndex: number,
  pageSize: number
) => {
  const { data: currentEra } = useCurrentEra();

  const fetcher =
    status === 'Active' ? activeValidatorFactory : waitingValidatorFactory;

  const { data: validators } = usePolkadotApiRx(
    useCallback(fetcher, [fetcher])
  );

  const pagedValidators = useMemo(
    () =>
      validators === null
        ? null
        : validators.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize),
    [validators, pageIndex, pageSize]
  );

  const batchPromise = useCallback(async (): Promise<Validator[] | null> => {
    if (pagedValidators === null || currentEra === null) {
      return null;
    }

    const api = await getPolkadotApiPromise();

    return Promise.all(
      pagedValidators.map(async (validator) => {
        const address = validator.toString();
        const identity = await getValidatorIdentity(address);

        // Self Staked Amount & Effective Amount Staked
        const exposure = await api.query.staking.erasStakers(
          currentEra,
          address
        );

        const selfStakedAmount = exposure.own.unwrap();
        const selfStaked = formatTokenBalance(selfStakedAmount);

        // Effective Amount Staked (Total)
        const totalStakeAmount = exposure.total.unwrap();
        const effectiveAmountStaked = formatTokenBalance(totalStakeAmount);

        // Delegations (Total # of Nominators)
        const delegationsValue = await getTotalNumberOfNominators(address);
        const delegations = delegationsValue.toString();

        const commission = await getValidatorCommission(address);

        return {
          address,
          identity,
          selfStaked,
          effectiveAmountStaked,
          effectiveAmountStakedRaw: totalStakeAmount.toString(),
          delegations,
          commission,
          status,
        };
      })
    ).then((validators) => {
      console.debug(
        `Fetched ${validators.length} ${status} paginated validators`
      );

      return validators;
    });
  }, [currentEra, pagedValidators, status]);

  const result = useSWR(
    [SwrBaseKey.ActiveValidatorsPaginated, status, pageIndex, pageSize],
    batchPromise,
    {
      // 3 minute polling interval.
      refreshInterval: 3 * 60 * 1000,
    }
  );

  return {
    ...result,
    data: result.data ?? null,
  };
};

export default useValidators;
