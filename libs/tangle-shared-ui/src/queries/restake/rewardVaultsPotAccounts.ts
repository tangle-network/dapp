import assertSubstrateAddress from '@tangle-network/ui-components/utils/assertSubstrateAddress';
import { map } from 'rxjs';
import useApiRx from '../../hooks/useApiRx';

const useVaultsPotAccounts = () => {
  const result = useApiRx((api) => {
    if (api.query.rewards?.rewardVaultsPotAccount === undefined) {
      return null;
    }

    return api.query.rewards.rewardVaultsPotAccount.entries().pipe(
      map((entries) => {
        const primitiveEntries = entries
          .filter(([, potAccount]) => potAccount.isSome)
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
  });

  return result;
};

export default useVaultsPotAccounts;
