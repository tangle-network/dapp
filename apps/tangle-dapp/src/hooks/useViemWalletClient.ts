import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import useEvmChain from '@webb-tools/tangle-shared-ui/hooks/useEvmChain';
import { useEffect, useState } from 'react';
import {
  createWalletClient,
  custom,
  EIP1193Provider,
  http,
  Transport,
  WalletClient,
} from 'viem';

export enum WalletClientTransport {
  /**
   * Used for interacting with blockchain nodes (e.g., Infura, Alchemy) that
   * support the JSON-RPC API. Ideal for querying blockchain data (e.g.,
   * balances, blocks, transactions) and broadcasting signed transactions.
   * Note: This transport cannot obtain wallet signatures as nodes do not manage
   * private keys.
   */
  HTTP_RPC,

  /**
   * Used for interacting with browser-injected EVM wallets (e.g., MetaMask,
   * Brave Wallet) via the `window.ethereum` object. Essential for obtaining
   * signatures, requesting wallet addresses, and user-approved transactions.
   * This transport securely interacts with wallets that manage private keys.
   */
  WINDOW,
}

declare global {
  interface Window {
    ethereum?: EIP1193Provider;
  }
}

const useViemWalletClient = (transport = WalletClientTransport.HTTP_RPC) => {
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const { network } = useNetworkStore();
  const evmChain = useEvmChain();

  // Update the wallet client when the network changes.
  useEffect(() => {
    if (evmChain === null || network.httpRpcEndpoint === undefined) {
      return;
    }

    let transport_: Transport;

    switch (transport) {
      case WalletClientTransport.HTTP_RPC:
        transport_ = http(network.httpRpcEndpoint);

        break;
      case WalletClientTransport.WINDOW:
        if (window.ethereum === undefined) {
          console.warn(
            'Could not create Viem wallet client due to Ethereum provider not found on window object.',
          );

          return;
        }

        transport_ = custom(window.ethereum);

        break;
    }

    const newWalletClient = createWalletClient({
      chain: evmChain,
      transport: transport_,
    });

    setWalletClient(newWalletClient);
  }, [evmChain, network, transport]);

  return walletClient;
};

export default useViemWalletClient;
