import type { Hex } from 'viem';

/**
 * Compute the sha256 of a File via `crypto.subtle`. The publisher contract
 * stores `bytes32 sha256Hash` — anything else is a UX bug.
 *
 * We hash the whole file in one shot. The web platform doesn't expose a
 * streaming SubtleCrypto API, but for the binary sizes we ship (single-digit
 * MB blueprints) the one-shot path is fine and simpler.
 */
export const sha256OfFile = async (file: File): Promise<Hex> => {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return toHex(digest);
};

export const sha256OfBytes = async (bytes: ArrayBuffer): Promise<Hex> => {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return toHex(digest);
};

const toHex = (bytes: ArrayBuffer): Hex => {
  const hex = Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `0x${hex}` as Hex;
};
