import { createWorkerFactory, useWorker } from '@shopify/react-web-worker';
import { useCallback } from 'react';
import { map, of } from 'rxjs';

import useNetworkStore from '../../context/useNetworkStore';
import useApiRx from '../../hooks/useApiRx';
import usePromise from '../../hooks/usePromise';

const createWorker = createWorkerFactory(
  () => import('./workers/calculateEraRewardPoint')
);

/**
 * Calculate the total restaking reward for the given era
 * @param era the era number
 */
function useRestakingEraReward(era: number | null = null) {
  const { rpcEndpoint } = useNetworkStore();

  const worker = useWorker(createWorker);

  const {
    result: dataPromise,
    isLoading: rxLoading,
    error: rxError,
  } = useApiRx(
    useCallback(
      (apiRx) => {
        if (
          !apiRx.query.roles.erasRestakeRewardPoints ||
          typeof era !== 'number'
        ) {
          return of(null);
        }

        return apiRx.query.roles.erasRestakeRewardPoints(era).pipe(
          map((rewardPoints) => {
            const individuals = rewardPoints.individual.entries();

            return worker.calculateEraRewardPoints(
              rpcEndpoint,
              era,
              Array.from(individuals).map(([accountId, rewardPoints]) => [
                accountId.toString(),
                rewardPoints.toNumber(),
              ])
            );
          })
        );
      },
      [era, rpcEndpoint, worker]
    )
  );

  const {
    result: data,
    isLoading: promiseLoading,
    error: promiseError,
  } = usePromise(
    useCallback(
      () => (dataPromise === null ? Promise.resolve(null) : dataPromise),
      [dataPromise]
    ),
    null
  );

  return {
    data,
    isLoading: rxLoading || promiseLoading,
    error: rxError || promiseError,
  };
}

export default useRestakingEraReward;
