import { useActiveAccount } from '@webb-tools/api-provider-environment/WebbProvider/subjects';

const useActiveAccountAddress = () => {
  const activeAccount = useActiveAccount();

  return activeAccount[0]?.address ?? null;
};

export default useActiveAccountAddress;
