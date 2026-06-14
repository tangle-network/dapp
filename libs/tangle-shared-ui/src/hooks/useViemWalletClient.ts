import useNetworkStore from '../context/useNetworkStore';
import useEvmChain from './useEvmChain';
import { useMemo } from 'react';
import {
  createWalletClient,
  custom,
  EIP1193Provider,
  http,
  Transport,
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

const useViemWalletClient = (transport = WalletClientTransport.HTTP_RPC) => {
  const network = useNetworkStore((store) => store.network2);
  const evmChain = useEvmChain();

  return useMemo(() => {
    if (evmChain === null || network?.httpRpcEndpoints === undefined) {
      return null;
    }

    let transport_: Transport;

    switch (transport) {
      case WalletClientTransport.HTTP_RPC:
        transport_ = http(network.httpRpcEndpoints[0]);

        break;
      case WalletClientTransport.WINDOW: {
        if (typeof window === 'undefined') {
          return null;
        }

        const ethereumProvider = window.ethereum as EIP1193Provider | undefined;
        if (ethereumProvider === undefined) {
          console.warn(
            'Could not create Viem wallet client due to Ethereum provider not found on window object.',
          );

          return null;
        }

        transport_ = custom(ethereumProvider);

        break;
      }
    }

    return createWalletClient({
      chain: evmChain,
      transport: transport_,
    });
  }, [evmChain, network, transport]);
};

export default useViemWalletClient;
