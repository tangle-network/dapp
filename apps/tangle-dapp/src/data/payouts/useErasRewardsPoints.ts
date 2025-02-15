import type { ApiRx } from '@polkadot/api';
import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import { map } from 'rxjs';

/**
 * Get all the entries of the staking.erasRewardPoints storage
 * key is the era number and value is an object with total and individual reward points
 * @returns the result of the query staking.erasRewardPoints.entries()
 */
const useErasRewardsPoints = () => useApiRx(erasRewardsPointsFetcher);

export default useErasRewardsPoints;

const erasRewardsPointsFetcher = (api: ApiRx) =>
  api.query.staking.erasRewardPoints.entries().pipe(
    map((entries) =>
      entries.map(
        ([key, value]) =>
          [
            key.args[0].toNumber(),
            {
              total: value.total.toNumber(),
              individual: new Map(
                Array.from(value.individual.entries()).map(([key, value]) => [
                  key.toString(),
                  value.toNumber(),
                ]),
              ),
            },
          ] as const,
      ),
    ),
  );
