import { PresetTypedChainId } from '@tangle-network/dapp-types';
import { EVMTokenEnum } from '@tangle-network/evm-contract-metadata';
import { BridgeToken } from '@tangle-network/tangle-shared-ui/types';

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
