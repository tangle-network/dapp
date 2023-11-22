import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';
import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';
import { createPublicClient, defineChain, http } from 'viem';

const tangleTestnetConfig = chainsConfig[PresetTypedChainId.TangleTestnet];
delete tangleTestnetConfig.contracts;

const tangleTestnet = defineChain(tangleTestnetConfig);

export const evmClient = createPublicClient({
  chain: tangleTestnet,
  transport: http(),
});
