import { ApiRx } from '@polkadot/api';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import assertSubstrateAddress from '@tangle-network/ui-components/utils/assertSubstrateAddress';
import { map, of } from 'rxjs';

const rewardVaultsPotAccountsRxQuery = (apiRx: ApiRx) => {
  if (apiRx.query.rewards?.rewardVaultsPotAccount === undefined) {
    return of(new Map<number, SubstrateAddress>());
  }

  return apiRx.query.rewards.rewardVaultsPotAccount.entries().pipe(
    map((entries) => {
      const primitiveEntries = entries
        .filter(([, potAccount]) => potAccount.isSome)
        .map(
          ([
            {
              args: [vaultId],
            },
            potAccount,
          ]) =>
            [
              vaultId.toNumber(),
              assertSubstrateAddress(potAccount.unwrap().toString()),
            ] as const,
        );

      return new Map(primitiveEntries);
    }),
  );
};

export default rewardVaultsPotAccountsRxQuery;
