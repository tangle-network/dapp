import { WebbRelayer } from '@webb-tools/abstract-api-provider';
import {
  ChainType,
  parseTypedChainId,
} from '@webb-tools/sdk-core/typed-chain-id';

function getRelayerFeePercentage(
  relayer: WebbRelayer,
  typedChainId: number,
): number | undefined {
  const chainType = parseTypedChainId(typedChainId).chainType;

  if (chainType === ChainType.Substrate) {
    console.warn(
      '[getRelayerFeePercentage] Relayer does not support Substrate yet',
    );
    return;
  }

  const cap = relayer.capabilities.supportedChains.evm.get(typedChainId);
  if (!cap) {
    return;
  }

  return cap.relayerFeeConfig?.relayerProfitPercent;
}

export default getRelayerFeePercentage;
