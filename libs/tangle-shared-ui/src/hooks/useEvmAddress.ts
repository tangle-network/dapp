import useActiveAccountAddress from './useActiveAccountAddress';
import { isEvmAddress, toEvmAddress } from '@tangle-network/ui-components';
import { EvmAddress } from '@tangle-network/ui-components/types/address';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';

/**
 * Obtain the EVM address of the active account, if any.
 *
 * @remarks
 * If there is no active account, `null` will be returned instead.
 */
const useEvmAddress20 = (): EvmAddress | null => {
  const { address: wagmiAddress } = useAccount();
  const activeAccountAddress = useActiveAccountAddress();

  const evmAddress = useMemo(() => {
    if (wagmiAddress && isEvmAddress(wagmiAddress)) {
      return toEvmAddress(wagmiAddress);
    }

    // Wait for the active account to be set, and ensure
    // that the active account is an EVM account.
    if (activeAccountAddress === null || !isEvmAddress(activeAccountAddress)) {
      return null;
    }

    return toEvmAddress(activeAccountAddress);
  }, [activeAccountAddress, wagmiAddress]);

  return evmAddress;
};

export default useEvmAddress20;
