import { useActiveAccount } from '@webb-tools/api-provider-environment/WebbProvider/subjects';

const useActiveAccountAddress = () => {
  const activeAccount = useActiveAccount();

  console.debug('activeAccount', activeAccount);

  return activeAccount[0]?.address ?? null;
};

export default useActiveAccountAddress;
