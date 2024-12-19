import { PublicKey } from '@solana/web3.js';
import { SolanaAddress } from '../types/address';

export function isSolanaAddress(address: string): address is SolanaAddress {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}