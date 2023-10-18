import { useWebContext } from '@webb-tools/api-provider-environment';
import type { Maybe, Nullable } from '@webb-tools/dapp-types/utils/types';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';

/**
 * Get the current typed chain id of the active chain.
 * - `undefined` if there is no active chain.
 * - `null` if the active chain is not supported.
 * - `number` if the active chain is supported.
 * @returns the current typed chain id of the active chain,
 * or undefined if there is no active chain,
 * or null if the active chain is not supported.
 */
const useCurrentTypedChainId = (): Nullable<Maybe<number>> => {
  const { activeChain } = useWebContext();

  if (activeChain == null) {
    return activeChain;
  }

  return calculateTypedChainId(activeChain.chainType, activeChain.id);
};

export default useCurrentTypedChainId;
