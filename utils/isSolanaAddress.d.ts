import { SolanaAddress } from '../types/address';
/**
 * Check if the provided address lies on the Ed25519 curve, ensuring it's a
 * valid Solana address.
 */
export declare function isSolanaAddress(address: string): address is SolanaAddress;
