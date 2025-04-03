import { NetworkType } from '@tangle-network/tangle-shared-ui/graphql/graphql';
import {
  getMultipleAccountInfo,
  IdentityType,
} from '@tangle-network/tangle-shared-ui/utils/polkadot/identity';
import { useQuery } from '@tanstack/react-query';
import { ACCOUNT_IDENTITIES_QUERY_KEY } from '../../../constants/query';
import { getRpcEndpoint } from '../../../utils/getRpcEndpoint';
import { Account } from '../types';

const fetcher = async (accounts: Pick<Account, 'id' | 'network'>[]) => {
  const { testnetRpc, mainnetRpc } = getRpcEndpoint('all');

  const testnetAccounts: string[] = [];
  const mainnetAccounts: string[] = [];

  accounts.forEach((account) => {
    if (account.network === NetworkType.Testnet) {
      testnetAccounts.push(account.id);
    } else {
      mainnetAccounts.push(account.id);
    }
  });

  const [testnetIdentities, mainnetIdentities] = await Promise.all([
    testnetAccounts.length > 0
      ? getMultipleAccountInfo(testnetRpc, testnetAccounts)
      : Promise.resolve([]),
    mainnetAccounts.length > 0
      ? getMultipleAccountInfo(mainnetRpc, mainnetAccounts)
      : Promise.resolve([]),
  ]);

  const identityMap = new Map<string, IdentityType>();

  testnetIdentities.forEach((identity, idx) => {
    const accountId = testnetAccounts.at(idx);
    if (identity && accountId) {
      identityMap.set(accountId, identity);
    }
  });

  mainnetIdentities.forEach((identity, idx) => {
    const accountId = mainnetAccounts.at(idx);
    if (identity && accountId) {
      identityMap.set(accountId, identity);
    }
  });

  return identityMap;
};

export function useAccountIdentities(
  accounts: Pick<Account, 'id' | 'network'>[],
) {
  return useQuery({
    queryKey: [ACCOUNT_IDENTITIES_QUERY_KEY, accounts],
    queryFn: () => fetcher(accounts),
    enabled: accounts.length > 0,
    staleTime: Infinity,
  });
}
