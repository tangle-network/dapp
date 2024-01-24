import { isEthereumAddress } from '@polkadot/util-crypto';
import { useActiveAccount } from '@webb-tools/api-provider-environment/WebbProvider/subjects';
import { useMemo } from 'react';

/**
 * Obtain the EVM address of the active account, if any.
 *
 * @remarks
 * If there is no active account, `null` will be returned instead.
 */
const useEvmAddress = () => {
  const activeAccount = useActiveAccount();
  const activeAccountAddress = activeAccount[0]?.address ?? null;

  const substrateAddress = useMemo(() => {
    // Wait for the active account to be set, and ensure
    // that the active account is an EVM account.
    if (
      activeAccountAddress === null ||
      !isEthereumAddress(activeAccountAddress)
    ) {
      return null;
    }

    // TODO: May need to convert to an EVM address, in case that the active account is a Substrate account.
    return activeAccountAddress;
  }, [activeAccountAddress]);

  return substrateAddress;
};

export default useEvmAddress;
