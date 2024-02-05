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

export const createEvmWalletClient = (address: string) =>
  createWalletClient({
    chain: tangleTestnet,
    account: ensureHex(address),
    transport: custom(window.ethereum),
  });
