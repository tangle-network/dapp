import { useCallback } from 'react';
import useApiRx from '../../hooks/useApiRx';
import useVaultPotAccount from './useVaultsPotAccounts';
import { map } from 'rxjs';
import { BN } from '@polkadot/util';
import { TangleError, TangleErrorCode } from '../../types/error';

const useVaultRewards = () => {
  const { result: vaultPotAccounts } = useVaultPotAccount();

  return useApiRx(
    useCallback(
      (apiRx) => {
        if (vaultPotAccounts === null) {
          return new TangleError(TangleErrorCode.INVALID_PARAMS);
        }

        const vaultPotAccountEntries = Array.from(vaultPotAccounts.entries());

        return apiRx.query.balances.account
          .multi(vaultPotAccountEntries.map(([, accountId]) => accountId))
          .pipe(
            map((balances) => {
              return balances.reduce((acc, balance, idx) => {
                const [vaultId] = vaultPotAccountEntries[idx];

                acc.set(vaultId, balance.free.toBn());
                return acc;
              }, new Map<number, BN>());
            }),
          );
      },
      [vaultPotAccounts],
    ),
  );
};

export default useVaultRewards;
