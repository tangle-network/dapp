import { useActiveAccount } from '@webb-tools/api-provider-environment/WebbProvider/subjects';

const useActiveAccountAddress = (): string | null => {
  const [activeAccount] = useActiveAccount();

  if (activeAccount === null) {
    return null;
  }

  return activeAccount.address;
};

export default useActiveAccountAddress;
