import { parseTypedChainId } from '@webb-tools/sdk-core';
import { PublicClient, createPublicClient, fallback, http } from 'viem';
import {
  VIEM_NOT_SUPPORTED_MULTICALL_CHAINS,
  defineViemChain,
  getViemChain,
} from './getViemChain';

function getViemClient(typedChainId: number): PublicClient {
  const { chainId } = parseTypedChainId(typedChainId);

  let chain = getViemChain(chainId);
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
