import { createWorkerFactory, useWorker } from '@shopify/react-web-worker';
import { useCallback } from 'react';
import { map } from 'rxjs';

import useNetworkStore from '../../context/useNetworkStore';
import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import usePromise from '../../hooks/usePromise';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import type { ErasRestakeRewardPointsEntry } from './types';

const createWorker = createWorkerFactory(
  () => import('./workers/calculateEarnings')
);

function useRestakingEarnings() {
  const { rpcEndpoint } = useNetworkStore();
  const activeAccount = useSubstrateAddress();

  const worker = useWorker(createWorker);

  const {
    data: dataPromise,
    isLoading: rxLoading,
    error: rxError,
  } = usePolkadotApiRx(
    useCallback(
      (apiRx) => {
        if (!apiRx.query.roles.erasRestakeRewardPoints) {
          return null;
        }

        if (activeAccount === null || activeAccount.length === 0) {
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
              activeAccount,
              serializableEntries
            );
          })
        );
      },
      [activeAccount, rpcEndpoint, worker]
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
