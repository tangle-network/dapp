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

const tangleTestnetConfig = chainsConfig[PresetTypedChainId.TangleTestnetEVM];

const tangleTestnet = defineChain(tangleTestnetConfig);

export const evmPublicClient = createPublicClient({
  chain: tangleTestnet,
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
    chain: tangleTestnet,
    account: ensureHex(accountAddress),
    transport: custom(window.ethereum),
  });
};
