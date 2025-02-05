import { useCallback } from 'react';
import useApiRx from '../../hooks/useApiRx';
import { map } from 'rxjs';

const useVaultPotAccount = () => {
  return useApiRx(
    useCallback((apiRx) => {
      if (apiRx.query.rewards?.rewardVaultsPotAccount === undefined) {
        return null;
      }

      return apiRx.query.rewards.rewardVaultsPotAccount.entries().pipe(
        map((entries) => {
          return entries.reduce(
            (
              acc,
              [
                {
                  args: [vaultId],
                },
                potAccount,
              ],
            ) => {
              if (potAccount.isSome) {
                acc.set(vaultId.toNumber(), potAccount.unwrap().toString());
              }

              return acc;
            },
            new Map<number, string>(),
          );
        }),
      );
    }, []),
  );
};

export default useVaultPotAccount;
