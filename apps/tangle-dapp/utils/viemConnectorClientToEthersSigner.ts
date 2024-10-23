import { providers } from 'ethers';
import type { Account, Chain, Client, Transport } from 'viem';

/**
 * Converts a Viem Connector client to an ethers signer
 * Code from https://wagmi.sh/react/guides/ethers
 * @param client The Viem Connector client to convert
 * @returns The converted ethers signer
 */
export default function viemConnectorClientToEthersSigner(
  client: Client<Transport, Chain, Account>,
) {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new providers.Web3Provider(transport, network);
  const signer = provider.getSigner(account.address);
  return signer;
}
