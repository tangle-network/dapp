import { PublicKey } from '@solana/web3.js';
import { SolanaAddress } from '../types/address';

/**
 * Check if the provided address lies on the Ed25519 curve, ensuring it's a
 * valid Solana address.
 */
export function isSolanaAddress(address: string): address is SolanaAddress {
  return PublicKey.isOnCurve(address);
}
