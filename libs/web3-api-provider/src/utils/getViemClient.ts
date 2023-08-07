import { parseTypedChainId } from '@webb-tools/sdk-core';
import { Chain, PublicClient, createPublicClient, fallback, http } from 'viem';
import {
  VIEM_NOT_SUPPORTED_MULTICALL_CHAINS,
  defineViemChain,
  getViemChain,
} from './getViemChain';
import { chainsConfig } from '@webb-tools/dapp-config/chains/evm';

function getViemClient(typedChainId: number): PublicClient {
  const { chainId } = parseTypedChainId(typedChainId);

  let chain: Chain | undefined = chainsConfig[typedChainId];

  if (!chain) {
    chain = getViemChain(typedChainId);
  }

  if (!chain || VIEM_NOT_SUPPORTED_MULTICALL_CHAINS.includes(chainId)) {
    chain = defineViemChain(typedChainId);
  }

  return createPublicClient({
    chain: chain,
    batch: {
      multicall: !!chain.contracts?.multicall3,
    },
    transport: fallback(
      chain.rpcUrls.public.http.map((url) => http(url, { timeout: 60_000 }))
    ),
  });
}

export default getViemClient;
