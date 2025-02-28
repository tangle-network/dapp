import { Network } from '@tangle-network/ui-components/constants/networks';
import { Chain } from 'viem';
import { chainsConfig } from '@tangle-network/dapp-config/chains/evm';
import { calculateTypedChainId, ChainType } from '@tangle-network/dapp-types';

const getTangleEvmChain = (
  network: Network & { evmChainId: number },
): Chain => {
  const typedEvmChainId = calculateTypedChainId(
    ChainType.EVM,
    network.evmChainId,
  );

  // Assume that the chain configuration is defined for all Tangle networks.
  if (chainsConfig[typedEvmChainId] === undefined) {
    throw new Error(
      `No EVM chain configuration is defined for Tangle network "${network.name}" (chain ID: ${network.evmChainId})`,
    );
  }

  return chainsConfig[typedEvmChainId];
};

export default getTangleEvmChain;
