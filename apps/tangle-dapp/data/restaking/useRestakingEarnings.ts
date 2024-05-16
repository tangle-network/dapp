import { createWorkerFactory, useWorker } from '@shopify/react-web-worker';
import { useCallback } from 'react';
import { map } from 'rxjs';

import useNetworkStore from '../../context/useNetworkStore';
import useApiRx from '../../hooks/useApiRx';
import usePromise from '../../hooks/usePromise';
import type { ErasRestakeRewardPointsEntry } from './types';

const createWorker = createWorkerFactory(
  () => import('./workers/calculateEarnings')
);

function useRestakingEarnings(accountAddress: string | null) {
  const { rpcEndpoint } = useNetworkStore();

  const worker = useWorker(createWorker);

  const {
    result: dataPromise,
    isLoading: rxLoading,
    error: rxError,
  } = useApiRx(
    useCallback(
      (apiRx) => {
        if (!apiRx.query.roles.erasRestakeRewardPoints) {
          return null;
        }

        if (accountAddress === null || accountAddress.length === 0) {
          return null;
        }

        return apiRx.query.roles.erasRestakeRewardPoints.entries().pipe(
          map((rewardPointsEntries) => {
            const serializableEntries = rewardPointsEntries
              .map(
                ([era, rewardPoints]) =>
                  [
                    era.args[0].toNumber(),
                    {
                      total: rewardPoints.total.toNumber(),
                      individual: Object.fromEntries(
                        Array.from(rewardPoints.individual.entries()).map(
                          ([accountId, rewardPoints]) => [
                            accountId.toString(),
                            rewardPoints.toNumber(),
                          ]
                        )
                      ),
                    },
                  ] satisfies ErasRestakeRewardPointsEntry
              )
              // Copy and sort the entries by era number
              .slice()
              .sort(([a], [b]) => a - b);

            return worker.calculateEarnings(
              rpcEndpoint,
              accountAddress,
              serializableEntries
            );
          })
        );
      },
      [accountAddress, rpcEndpoint, worker]
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

export default useRestakingEarnings;
