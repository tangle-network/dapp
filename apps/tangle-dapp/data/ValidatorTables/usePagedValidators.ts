import { ApiRx } from '@polkadot/api';
import { AccountId } from '@polkadot/types/interfaces';
import { useCallback, useMemo } from 'react';
import { map, Observable } from 'rxjs';

import { SwrBaseKey } from '../../constants';
import useRpcEndpointStore from '../../context/useRpcEndpointStore';
import { LocalStorageKey } from '../../hooks/useLocalStorage';
import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import useSwrWithLocalStorage from '../../hooks/useSwrWithLocalStorage';
import { Validator } from '../../types';
import useCurrentEra from '../staking/useCurrentEra';
import { getValidatorDetails, ValidatorStatus } from './getValidatorDetails';

type ValidatorObservableFactory = (api: ApiRx) => Observable<AccountId[]>;

export const waitingValidatorFactory: ValidatorObservableFactory = (api) =>
  api.derive.staking
    .waitingInfo()
    .pipe(
      map((waiting) => waiting.info.map((validator) => validator.accountId))
    );

export const activeValidatorFactory: ValidatorObservableFactory = (api) =>
  api.query.session.validators();

const usePagedValidators = (
  status: ValidatorStatus,
  pageIndex: number,
  pageSize: number
) => {
  const { data: currentEra } = useCurrentEra();

  const fetcher =
    status === 'Active' ? activeValidatorFactory : waitingValidatorFactory;

  const { data: validators } = usePolkadotApiRx(
    useCallback(fetcher, [fetcher])
  );

  const { rpcEndpoint } = useRpcEndpointStore();

  const pagedValidatorAddresses = useMemo(
    () =>
      validators === null
        ? null
        : validators.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize),
    [validators, pageIndex, pageSize]
  );

  const batchPromise = useCallback(async (): Promise<Validator[] | null> => {
    if (pagedValidatorAddresses === null || currentEra === null) {
      return null;
    }

    return Promise.all(
      pagedValidatorAddresses.map(async (address) =>
        getValidatorDetails(rpcEndpoint, address, status)
      )
    ).then((validators) => {
      console.debug(
        `Fetched ${validators.length} ${status} paginated validators`
      );

      return validators;
    });
  }, [currentEra, pagedValidatorAddresses, rpcEndpoint, status]);

  const localStorageKey =
    status === 'Active'
      ? LocalStorageKey.ACTIVE_VALIDATOR_CACHE
      : LocalStorageKey.WAITING_VALIDATOR_CACHE;

  // Note that the page index does not matter much here, since
  // the validator list is not sorted in any particular order,
  // thus it's okay to show an initial arbitrary set of validators.
  const result = useSwrWithLocalStorage({
    localStorageKey,
    swrKey: [
      SwrBaseKey.ACTIVE_VALIDATORS_PAGINATED,
      status,
      pageIndex,
      pageSize,
    ],
    fetcher: batchPromise,
    swrConfig: {
      // 3 minute polling interval.
      refreshInterval: 3 * 60 * 1000,
    },
  });

  return result;
};

export default usePagedValidators;
