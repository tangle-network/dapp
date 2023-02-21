interface NativeTokenInfo {
  decimals: number;
  symbol: string;
  name: string;
}

// The chain info is retrieved from https://github.com/ethereum-lists/chains
const CHAIN_URL = 'https://chainid.network/chains.json';

/**
 * Retrieves the native token info for the given evm chain id
 * @param chainId the evm chain id to retrieve the native token info for
 * @returns the native token info for the given evm chain id
 */
export async function getNativeTokenInfo(
  chainId: number
): Promise<NativeTokenInfo | null> {
  try {
    const response = await fetch(CHAIN_URL);

    const data: Array<{ nativeCurrency: NativeTokenInfo; chainId: number }> =
      await response.json();

    const chain = data.find((chain) => chain.chainId === chainId);

    if (!chain) {
      return null;
    }

    return chain.nativeCurrency;
  } catch (error) {
    console.log('Unable to retrieve native token information', error);
    return null;
  }
}
