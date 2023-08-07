import { PolkadotVAnchorActions } from '@webb-tools/polkadot-api-provider';
import { ChainType } from '@webb-tools/sdk-core';
import { Web3VAnchorActions } from '@webb-tools/web3-api-provider';

const VAnchorActionClasses = {
  [ChainType.EVM]: Web3VAnchorActions,
  [ChainType.Substrate]: PolkadotVAnchorActions,
};

type SupportedChainType = keyof typeof VAnchorActionClasses;

const isSupportedChainType = (
  chainType: ChainType
): chainType is SupportedChainType => {
  return chainType in VAnchorActionClasses;
};

export default function getVAnchorActionClass(chainType: ChainType) {
  if (!isSupportedChainType(chainType)) {
    throw new Error(`Unsupported chain type: ${chainType}`);
  }
  return VAnchorActionClasses[chainType];
}
