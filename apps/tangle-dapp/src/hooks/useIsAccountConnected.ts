import { useActiveAccount } from '@tangle-network/api-provider-environment/hooks/useActiveAccount';

const useIsAccountConnected = (): boolean => {
  const [activeAccount] = useActiveAccount();

  return activeAccount?.address !== undefined;
};

export default useIsAccountConnected;
