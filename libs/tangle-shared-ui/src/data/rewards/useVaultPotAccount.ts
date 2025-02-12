import { useCallback } from 'react';
import useApiRx from '../../hooks/useApiRx';
import rewardVaultsPotAccountsRxQuery from '../../queries/restake/rewardVaultsPotAccounts';

const useVaultPotAccount = () => {
  return useApiRx(
    useCallback((apiRx) => {
      if (apiRx.query.rewards?.rewardVaultsPotAccount === undefined) {
        return null;
      }

      return rewardVaultsPotAccountsRxQuery(apiRx);
    }, []),
  );
};

export default useVaultPotAccount;
