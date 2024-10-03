import { useActiveAccount } from '@webb-tools/api-provider-environment/WebbProvider/subjects';

const useIsAccountConnected = (): boolean => {
  const [activeAccount] = useActiveAccount();

  return activeAccount?.address !== undefined;
};

export default useIsAccountConnected;
