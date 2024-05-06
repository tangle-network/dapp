import { useActiveAccount } from '@webb-tools/api-provider-environment/WebbProvider/subjects';

const useActiveAccountAddress = <DefaultValue extends string | null>(
  defaultValue: DefaultValue = null as DefaultValue
): DefaultValue => {
  const [activeAccount] = useActiveAccount();

  if (activeAccount === null) {
    return defaultValue;
  }

  return activeAccount.address as DefaultValue;
};

export default useActiveAccountAddress;
