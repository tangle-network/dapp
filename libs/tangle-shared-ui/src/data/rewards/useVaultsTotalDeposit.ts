import { map } from 'rxjs';
import useApiRx from '../../hooks/useApiRx';
import { useCallback } from 'react';
import { BN } from '@polkadot/util';

const useVaultsTotalDeposit = () => {
  return useApiRx(
    useCallback((apiRx) => {
      if (apiRx.query.rewards?.totalRewardVaultDeposit === undefined) {
        return null;
      }

      return apiRx.query.rewards.totalRewardVaultDeposit.entries().pipe(
        map((entries) => {
          return entries.reduce(
            (
              acc,
              [
                {
                  args: [vaultId],
                },
                totalDeposit,
              ],
            ) => {
              return acc.set(vaultId.toNumber(), totalDeposit.toBn());
            },
            new Map<number, BN>(),
          );
        }),
      );
    }, []),
  );
};

export default useVaultsTotalDeposit;
