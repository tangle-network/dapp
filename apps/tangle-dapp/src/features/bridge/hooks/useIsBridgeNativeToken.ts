import { PresetTypedChainId } from '@tangle-network/dapp-types';
import { EVMTokenEnum } from '@tangle-network/evm-contract-metadata';
import useBridgeStore from '../context/useBridgeStore';
import { useShallow } from 'zustand/react/shallow';

const useIsBridgeNativeToken = (
  sourceTypedChainId: PresetTypedChainId,
): boolean => {
  const selectedToken = useBridgeStore(
    useShallow((store) => store.selectedToken),
  );

  if (!selectedToken) return false;

  const isNativeToken =
    (sourceTypedChainId === PresetTypedChainId.TangleMainnetEVM &&
      selectedToken.tokenType === EVMTokenEnum.TNT) ||
    (sourceTypedChainId === PresetTypedChainId.Polygon &&
      selectedToken.symbol === 'POL') ||
    ((sourceTypedChainId === PresetTypedChainId.Optimism ||
      sourceTypedChainId === PresetTypedChainId.Arbitrum ||
      sourceTypedChainId === PresetTypedChainId.Base) &&
      selectedToken.symbol === 'ETH') ||
    (sourceTypedChainId === PresetTypedChainId.BSC &&
      selectedToken.symbol === 'BNB');

  return isNativeToken;
};

export default useIsBridgeNativeToken;
