import { useWebContext } from '@nepoche/api-provider-environment';

/**
 * @name useAccounts
 */
export const useAccounts = () => {
  const data = useWebContext();
  return {
    accounts: data.accounts,
    active: data.activeAccount,
    setActiveAccount: data.setActiveAccount,
  };
};
