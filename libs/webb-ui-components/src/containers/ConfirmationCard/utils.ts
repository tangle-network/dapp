import { TokenRingValue } from '../../components/TokensRing/types';

export const getTokenRingValue = (
  symbol: string
): TokenRingValue | undefined => {
  const tkRingValues = [
    'eth',
    'dot',
    'avax',
    'ksm',
    'one',
    'arbitrum',
    'op',
    'matic',
  ];
  const isTokenRingValue = tkRingValues.includes(symbol.toLowerCase());

  return isTokenRingValue
    ? (symbol.toLowerCase() as TokenRingValue)
    : undefined;
};
