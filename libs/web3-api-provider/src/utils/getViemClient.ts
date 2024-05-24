import { chainsConfig } from '@webb-tools/dapp-config/chains/evm';
import { parseTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import {
  createPublicClient,
  fallback,
  http,
  type Chain,
  type FallbackTransport,
  type PublicClient,
} from 'viem';
import {
  VIEM_NOT_SUPPORTED_MULTICALL_CHAINS,
  defineViemChain,
  getViemChain,
} from './getViemChain';

function getViemClient(
  typedChainId: number,
): PublicClient<FallbackTransport, Chain> {
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
      chain.rpcUrls.default.http.map((url) => http(url, { timeout: 60_000 })),
    ),
  });
}

export default getViemClient;
