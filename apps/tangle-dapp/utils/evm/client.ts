import { ensureHex } from '@webb-tools/dapp-config';
import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';
import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';
import {
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
  http,
} from 'viem';

const TANGLE_TESTNET_CONFIG = chainsConfig[PresetTypedChainId.TangleTestnetEVM];

const TANGLE_TESTNET_CHAIN = defineChain(TANGLE_TESTNET_CONFIG);

// TODO: This should not be hardcoded to the testnet, it should be using the network that the user is currently connected to.
export const evmPublicClient = createPublicClient({
  chain: TANGLE_TESTNET_CHAIN,
  transport: http(),
});

export const createEvmWalletClient = (accountAddress: string) => {
  // TODO: Might need to handle this more gracefully. Or at least from the caller(s) (add description to the function to make it clear that it may fail and throw an error).
  if (typeof window.ethereum === 'undefined') {
    throw new Error(
      'window.ethereum is undefined, but is required for EVM actions'
    );
  }

  return createWalletClient({
    chain: TANGLE_TESTNET_CHAIN,
    account: ensureHex(accountAddress),
    transport: custom(window.ethereum),
  });
};
