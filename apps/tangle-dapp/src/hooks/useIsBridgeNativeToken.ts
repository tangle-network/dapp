import { PresetTypedChainId } from '@webb-tools/dapp-types';
import { EVMTokenEnum } from '@webb-tools/evm-contract-metadata';
import { BridgeToken } from '@webb-tools/tangle-shared-ui/types';

const useIsBridgeNativeToken = (
  sourceTypedChainId: PresetTypedChainId,
  token: BridgeToken,
) => {
  const isNativeToken =
    (sourceTypedChainId === PresetTypedChainId.TangleMainnetEVM &&
      token.tokenType === EVMTokenEnum.TNT) ||
    (sourceTypedChainId === PresetTypedChainId.Polygon &&
      token.symbol === 'POL') ||
    ((sourceTypedChainId === PresetTypedChainId.Optimism ||
      sourceTypedChainId === PresetTypedChainId.Arbitrum ||
      sourceTypedChainId === PresetTypedChainId.Base) &&
      token.symbol === 'ETH') ||
    (sourceTypedChainId === PresetTypedChainId.BSC && token.symbol === 'BNB');

  return isNativeToken;
};

export default useIsBridgeNativeToken;
