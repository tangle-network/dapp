import assertSubstrateAddress from '@tangle-network/ui-components/utils/assertSubstrateAddress';
import { map } from 'rxjs';
import useApiRx from '../../hooks/useApiRx';
import { useCallback } from 'react';

const useVaultsPotAccounts = () => {
  return useApiRx(
    useCallback((api) => {
      return api.query.rewards.rewardVaultsPotAccount.entries().pipe(
        map((entries) => {
          const primitiveEntries = entries
            .filter(([, potAccountOpt]) => potAccountOpt.isSome)
            .map(([key, potAccount]) => {
              const vaultId = key.args[0];

              return [
                vaultId.toNumber(),
                assertSubstrateAddress(potAccount.unwrap().toString()),
              ] as const;
            });

          return new Map(primitiveEntries);
        }),
      );
    }, []),
  );
};

export default useVaultsPotAccounts;
