import useActiveAccountAddress from './useActiveAccountAddress';
import { isEvmAddress } from '@tangle-network/ui-components/utils/isEvmAddress20';
import { EvmAddress } from '@tangle-network/ui-components/types/address';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';

/**
 * Obtain the EVM address of the active account, if any.
 *
 * @remarks
 * If there is no active account, `null` will be returned instead.
 *
 * @remarks
 * Both call sites only ever return EVM addresses (gated by `isEvmAddress`),
 * so we deliberately avoid `toEvmAddress` here — it imports
 * `@polkadot/util-crypto`, which would yank the polkadot vendor chunk into
 * the eager dependency graph for EVM-only routes.
 */
const useEvmAddress20 = (): EvmAddress | null => {
  const { address: wagmiAddress } = useAccount();
  const activeAccountAddress = useActiveAccountAddress();

  const evmAddress = useMemo(() => {
    if (wagmiAddress && isEvmAddress(wagmiAddress)) {
      return wagmiAddress;
    }

    // Wait for the active account to be set, and ensure
    // that the active account is an EVM account.
    if (activeAccountAddress === null || !isEvmAddress(activeAccountAddress)) {
      return null;
    }

    return activeAccountAddress;
  }, [activeAccountAddress, wagmiAddress]);

  return evmAddress;
};

export default useEvmAddress20;
