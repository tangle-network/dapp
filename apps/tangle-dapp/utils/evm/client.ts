import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';
import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';
import { createPublicClient, defineChain, http } from 'viem';

const TANGLE_TESTNET_CONFIG = chainsConfig[PresetTypedChainId.TangleTestnetEVM];

const TANGLE_TESTNET_CHAIN = defineChain(TANGLE_TESTNET_CONFIG);

// TODO: This should not be hardcoded to the testnet, it should be using the network that the user is currently connected to.
export const evmPublicClient = createPublicClient({
  chain: TANGLE_TESTNET_CHAIN,
  transport: http(),
});
