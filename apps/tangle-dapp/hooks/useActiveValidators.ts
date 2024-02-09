import { useCallback, useMemo } from 'react';

import useCurrentEra from '../data/staking/useCurrentEra';
import { Validator } from '../types';
import {
  formatTokenBalance,
  getPolkadotApiPromise,
  getTotalNumberOfNominators,
  getValidatorCommission,
  getValidatorIdentity,
} from '../utils/polkadot';
import usePolkadotApiRx from './usePolkadotApiRx';
import usePromise from './usePromise';

const useActiveValidators = (pageIndex: number, pageSize: number) => {
  const { data: currentEra } = useCurrentEra();

  const { data: allValidators } = usePolkadotApiRx(
    useCallback((api) => api.query.session.validators(), [])
  );

  const pagedValidators = useMemo(
    () =>
      allValidators === null
        ? null
        : allValidators.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize),
    [allValidators, pageIndex, pageSize]
  );

  const allPromise = useCallback(async (): Promise<Validator[] | null> => {
    if (pagedValidators === null || currentEra === null) {
      return null;
    }

    const api = await getPolkadotApiPromise();

    return Promise.all(
      pagedValidators.map(async (validator) => {
        console.debug('loading validator', validator.toString());

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
          address: address,
          identity,
          selfStaked,
          effectiveAmountStaked,
          effectiveAmountStakedRaw: totalStakeAmount.toString(),
          delegations,
          commission,
          status: 'Active',
        };
      })
    );
  }, [currentEra, pagedValidators]);

  return usePromise(allPromise, null);
};

export default useActiveValidators;
