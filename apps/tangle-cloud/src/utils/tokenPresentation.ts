import { Address } from 'viem';
import { getCachedTokenMetadata } from '@tangle-network/dapp-config/tokenMetadata';

export const isFallbackSymbol = (symbol: string): boolean =>
  symbol.startsWith('0x') || symbol.includes('...');

export const resolveTokenIconSymbol = (
  chainId: number,
  symbol: string,
  address: Address,
): string | null => {
  const cached = getCachedTokenMetadata(chainId, address);
  const candidate = isFallbackSymbol(symbol)
    ? (cached?.symbol ?? symbol)
    : symbol;
  return isFallbackSymbol(candidate) ? null : candidate;
};
