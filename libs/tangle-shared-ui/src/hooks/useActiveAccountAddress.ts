import { useActiveAccount } from '@tangle-network/api-provider-environment/hooks/useActiveAccount';
import { isEvmAddress } from '@tangle-network/ui-components/utils/isEvmAddress20';
import { isSubstrateAddress } from '@tangle-network/ui-components/utils/isSubstrateAddress';
import { isSolanaAddress } from '@tangle-network/ui-components/utils/isSolanaAddress';
import {
  EvmAddress,
  SolanaAddress,
  SubstrateAddress,
} from '@tangle-network/ui-components/types/address';

/**
 * Returns the active account's address as-is, gated by address-type checks.
 *
 * @remarks
 * Previously, substrate addresses were re-encoded to match the active
 * network's SS58 prefix here via `toSubstrateAddress`. That import pulls
 * `@polkadot/util-crypto` and contributes ~874KB to every cold load, even
 * for EVM-only users.
 *
 * Cross-prefix re-encoding is purely cosmetic — the underlying account is
 * identical. Substrate-only consumers that genuinely need a specific
 * SS58-prefixed display string should call `toSubstrateAddress` directly
 * (those callsites live behind lazy substrate-route boundaries).
 */
const useActiveAccountAddress = ():
  | SubstrateAddress
  | EvmAddress
  | SolanaAddress
  | null => {
  const [activeAccount] = useActiveAccount();

  const address = activeAccount?.address;

  if (address === undefined) {
    return null;
  }

  if (isSolanaAddress(address)) {
    return address;
  }

  if (isEvmAddress(address) || isSubstrateAddress(address)) {
    return address;
  }

  console.warn(`Unknown address type: ${address}`);
  return address as SubstrateAddress;
};

export default useActiveAccountAddress;
