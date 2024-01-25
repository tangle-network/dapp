import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';

function isAllowSubstrateAddress(typedChainId: number, tokenAddress?: string) {
  let isNative = false;

  try {
    if (tokenAddress) {
      isNative = BigInt(tokenAddress) === ZERO_BIG_INT;
    }
  } catch {
    // Ignore error
  }

  return typedChainId === PresetTypedChainId.TangleTestnetEVM && isNative;
}

export default isAllowSubstrateAddress;
