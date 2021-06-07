import { useWebContext } from '@webb-dapp/react-environment';

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
