import { useCallback } from 'react';
import { map, of } from 'rxjs';

import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';

/**
 * Type for the restaking earnings record,
 * key is the era number and value is the restaking earnings for that era
 */
export type EarningRecord = Record<number, number>;

/**
 * Hook to get the restaking earnings for a given account
 * @param substrateAccount the account to get the restaking earnings for
 * @returns a record of era number to the restaking earnings for that era
 */
const useRestakingEarnings = (substrateAccount: string | null) =>
  usePolkadotApiRx(
    useCallback(
      (apiRx) => {
        if (!substrateAccount) return of(null);

        if (!('erasRestakeRewardPoints' in apiRx.query.roles))
          return of<EarningRecord>({});

        return apiRx.query.roles.erasRestakeRewardPoints.entries().pipe(
          map((entries) => {
            return entries.reduce((prev, [era, eraRewardPoints]) => {
              eraRewardPoints.individual.forEach((reward, accountId32) => {
                if (accountId32.toString() === substrateAccount) {
                  prev[era.args[0].toNumber()] = reward.toNumber();
                }
              });

              return prev;
            }, {} as EarningRecord);
          })
        );
      },
      [substrateAccount]
    )
  );

export default useRestakingEarnings;
