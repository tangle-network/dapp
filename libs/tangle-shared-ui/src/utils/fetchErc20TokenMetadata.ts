import { isEvmAddress } from '@tangle-network/ui-components';
import { EvmAddress } from '@tangle-network/ui-components/types/address';
import { ContractFunctionName, erc20Abi, PublicClient } from 'viem';
import { z } from 'zod';

type TokenMetadata = {
  id: EvmAddress;
  name: string;
  symbol: string;
  decimals: number;
};

const TokenMetadataSchema = z.object({
  id: z.custom<EvmAddress>(
    (value) => typeof value === 'string' && isEvmAddress(value),
    { message: 'Invalid Ethereum address format' },
  ),
  name: z.string(),
  symbol: z.string(),
  decimals: z.number(),
});

const fetchErc20TokenMetadata = async (
  viemPublicClient: PublicClient,
  contractAddresses: EvmAddress[],
): Promise<TokenMetadata[]> => {
  const functionNames = [
    'name',
    'symbol',
    'decimals',
  ] as const satisfies ContractFunctionName<typeof erc20Abi, 'view'>[];

  const calls = contractAddresses.flatMap((address) =>
    functionNames.map((functionName) => ({
      address,
      abi: erc20Abi,
      functionName,
    })),
  );

  try {
    const results = await viemPublicClient.multicall({ contracts: calls });
    const metadatas: TokenMetadata[] = [];

    for (
      let addressIndex = 0;
      addressIndex < contractAddresses.length;
      addressIndex++
    ) {
      const id = contractAddresses[addressIndex];

      // Calculate the starting index for this address's results.
      const baseIndex = addressIndex * functionNames.length;

      const nameResult = results[baseIndex];
      const symbolResult = results[baseIndex + 1];
      const decimalsResult = results[baseIndex + 2];

      // Report failures and skip this token.
      if (nameResult?.error || symbolResult?.error || decimalsResult?.error) {
        console.warn(
          `Failed to fetch complete ERC20 token metadata for address ${id} (chain: ${viemPublicClient.chain?.name})`,
          {
            nameError: nameResult?.error,
            symbolError: symbolResult?.error,
            decimalsError: decimalsResult?.error,
          },
        );

        continue;
      }

      try {
        const token = TokenMetadataSchema.parse({
          id,
          name: nameResult.result,
          symbol: symbolResult.result,
          decimals: Number(decimalsResult.result),
        });

        metadatas.push(token);
      } catch (parseError) {
        console.warn(
          `Failed to validate ERC20 token metadata for address ${id}`,
          parseError,
        );
      }
    }

    return metadatas;
  } catch (multicallError) {
    console.error(
      `Multicall failed for ERC20 tokens (chain: ${viemPublicClient.chain?.name})`,
      multicallError,
    );

    return [];
  }
};

export default fetchErc20TokenMetadata;
