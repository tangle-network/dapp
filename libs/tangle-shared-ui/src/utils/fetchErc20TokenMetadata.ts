import { EvmAddress } from '@tangle-network/ui-components/types/address';
import { erc20Abi, PublicClient } from 'viem';

const fetchErc20TokenMetadata = async (
  viemPublicClient: PublicClient,
  contractAddress: EvmAddress,
) => {
  try {
    // Should check support of multicall3
    const [name, symbol, decimals] = await Promise.all([
      viemPublicClient.readContract({
        address: contractAddress,
        abi: erc20Abi,
        functionName: 'name',
        args: [],
      }),
      viemPublicClient.readContract({
        address: contractAddress,
        abi: erc20Abi,
        functionName: 'symbol',
        args: [],
      }),
      viemPublicClient.readContract({
        address: contractAddress,
        abi: erc20Abi,
        functionName: 'decimals',
        args: [],
      }),
    ] as const);

    return {
      name,
      symbol,
      decimals,
    };
  } catch (e) {
    console.warn(
      `Failed to fetch ERC20 token metadata (is the contract deployed on this network?) (chain: ${viemPublicClient.chain?.name})`,
    );
    console.error(e);

    return null;
  }
};

export default fetchErc20TokenMetadata;
