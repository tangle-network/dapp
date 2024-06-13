import { providers } from 'ethers';
import type { Chain, PublicClient, Transport } from 'viem';

/**
 * Converts a Viem network client to an ethers provider.
 * Code from https://wagmi.sh/react/guides/ethers
 * Notes: Sygma SDK currently only works with ethers version 5
 * @param client The Viem network client to convert.
 * @returns The converted ethers provider.
 */
export default function viemNetworkClientToEthersProvider(
  client: PublicClient<Transport, Chain>,
): providers.BaseProvider {
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };

  if (transport.type === 'fallback')
    return new providers.FallbackProvider(
      (transport.transports as ReturnType<Transport>[]).map(
        ({ value }) => new providers.JsonRpcProvider(value?.url, network),
      ),
    );
  return new providers.JsonRpcProvider(transport.url, network);
}
