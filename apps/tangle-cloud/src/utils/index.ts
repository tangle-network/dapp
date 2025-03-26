import { EvmAddress, SubstrateAddress } from "@tangle-network/ui-components/types/address";
import { isSubstrateAddress } from "@tangle-network/ui-components/utils/isSubstrateAddress";
import { decodeAddress } from '@polkadot/util-crypto';

export const toTanglePrimitiveEcdsaKey = (address: SubstrateAddress | EvmAddress): Uint8Array | null => {
  try {
    let originalKey: Uint8Array;
  if (isSubstrateAddress(address)) {
    const decoded = decodeAddress(address);
    originalKey = Buffer.from(decoded);
  } else {
    originalKey = Buffer.from(address.toString().slice(2), 'hex');
  }
  const ecdsaKey = new Uint8Array(65);
  ecdsaKey.set(
    originalKey.length > 65 ? originalKey.slice(0, 65) : originalKey,
    0,
  );

    return ecdsaKey;
  } catch (error) {
    console.error("Parse address failed with error", error);
    return null;
  }
  
}