import { PresetTypedChainId } from '@tangle-network/dapp-types';

export default function getHyperlaneChainName(typedChainId: number) {
  switch (typedChainId) {
    case PresetTypedChainId.EthereumMainNet:
      return 'ethereum';
    case PresetTypedChainId.Arbitrum:
      return 'arbitrum';
    case PresetTypedChainId.Optimism:
      return 'optimism';
    case PresetTypedChainId.Base:
      return 'base';
    case PresetTypedChainId.BSC:
      return 'bsc';
    case PresetTypedChainId.Polygon:
      return 'polygon';
    case PresetTypedChainId.TangleMainnetEVM:
      return 'tangle';
    case PresetTypedChainId.TangleTestnetEVM:
      return 'tangletestnet';
    case PresetTypedChainId.Holesky:
      return 'holesky';
    default:
      throw new Error('Unknown chain');
  }
}
