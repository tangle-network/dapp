import { SolanaAddress } from '../types/address';

/**
 * Solana addresses are base58-encoded 32-byte public keys, which yields
 * strings of length 32–44 using the base58 alphabet (omits `0`, `O`, `I`,
 * `l`).
 *
 * @remarks
 * This is a structural check only — it does not verify that the decoded
 * bytes are a valid ed25519 curve point. Strict on-curve validation is
 * available via `isSolanaAddressStrict` (which dynamically imports
 * `@solana/web3.js`).
 *
 * Why not use `@solana/web3.js` here?
 *
 * `new PublicKey(address)` from `@solana/web3.js` pulls in `bn.js`,
 * `@noble/curves`, and CommonJS interop helpers. Those modules then end up
 * grouped into the same vendor chunk as `@polkadot/*` (because they share
 * runtime helpers), forcing the entire ~850KB polkadot vendor bundle into
 * the eager modulepreload waterfall on every cold load — even for users
 * who never touch a substrate flow.
 *
 * The structural check is sufficient for all current callers, which use
 * `isSolanaAddress` as a discriminator between EVM / substrate / Solana
 * addresses (these have non-overlapping shapes). The strict version exists
 * for any callsite that genuinely needs on-curve validation.
 */
const BASE58_ALPHABET_REGEX = /^[1-9A-HJ-NP-Za-km-z]+$/;

export function isSolanaAddress(address: string): address is SolanaAddress {
  if (typeof address !== 'string') {
    return false;
  }

  // EVM addresses (`0x` prefix) and substrate hex (`0x...`) are explicitly
  // ruled out because they contain `0` which is not part of base58.
  if (address.startsWith('0x')) {
    return false;
  }

  // Solana addresses encode 32 raw bytes. Base58 of 32 bytes is between 32
  // and 44 characters in length.
  if (address.length < 32 || address.length > 44) {
    return false;
  }

  return BASE58_ALPHABET_REGEX.test(address);
}

/**
 * Strictly validate a Solana address by decoding it and checking that the
 * underlying public key lies on the ed25519 curve.
 *
 * Loads `@solana/web3.js` lazily — only call this from code paths that are
 * already behind a route-level lazy boundary, otherwise you'll undo the
 * bundle-size win that motivated splitting `isSolanaAddress` from this
 * function.
 */
export async function isSolanaAddressStrict(address: string): Promise<boolean> {
  if (!isSolanaAddress(address)) {
    return false;
  }

  try {
    const { PublicKey } = await import('@solana/web3.js');
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}
