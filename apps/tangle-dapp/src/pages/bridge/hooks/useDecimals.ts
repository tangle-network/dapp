'use client';

import useSelectedToken from './useSelectedToken';
import useTypedChainId from './useTypedChainId';

export default function useDecimals() {
  const token = useSelectedToken();
  const { sourceTypedChainId } = useTypedChainId();

  return token.decimals[sourceTypedChainId] ?? token.decimals.default;
}
