import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import useProviderStore from '../context/useProviderStore';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  EvmAddress,
  SubstrateAddress,
} from '@webb-tools/webb-ui-components/types/address';
import {
  assertEvmAddress,
  assertSubstrateAddress,
} from '@webb-tools/webb-ui-components';
import ensureError from '../utils/ensureError';
import { EIP1193Provider } from 'viem';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import useEvmChain from './useEvmChain';
import assert from 'assert';

declare global {
  interface Window {
    ethereum?: EIP1193Provider;
  }
}

const useProvider = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const evmChain = useEvmChain();

  const {
    activeAccountAddress,
    accounts,
    provider,
    setActiveAccountAddress,
    setAccounts,
    setProvider,
  } = useProviderStore();

  /**
   * Switch accounts within the same provider/wallet.
   */
  const trySwitchAccount = useCallback(
    (newAccountAddress: SubstrateAddress | EvmAddress): boolean => {
      if (accounts === undefined) {
        return false;
      }

      const newAccount = accounts.find(
        (account) => account.address === newAccountAddress,
      );

      if (newAccount === undefined) {
        return false;
      }

      setActiveAccountAddress(newAccountAddress);

      return true;
    },
    [accounts, setActiveAccountAddress],
  );

  const disconnect = useCallback(() => {
    setAccounts(undefined);
    setActiveAccountAddress(undefined);
    setProvider(undefined);
  }, [setAccounts, setActiveAccountAddress, setProvider]);

  const connectSubstrateWallet = useCallback(
    async (appName: string): Promise<Error | true> => {
      setIsConnecting(true);

      // Request access to any installed Substrate wallet extensions.
      const extensions = await web3Enable(appName);

      // No extension found or the user did not grant permission.
      if (extensions.length === 0) {
        setIsConnecting(false);

        return new Error('No wallet extensions detected or permission denied');
      }

      // Fetch all accounts across all enabled extensions.
      const accounts = await web3Accounts();

      const defaultAccount = accounts.at(0);

      // No accounts found.
      if (accounts.length === 0 || defaultAccount === undefined) {
        setIsConnecting(false);
        disconnect();

        return new Error('No accounts found in the connected wallet');
      }

      // TODO: Obtain this from local storage, persist what was the last connected account.

      const newProvider = extensions.find(
        (provider) => provider.name === defaultAccount.meta.source,
      );

      if (newProvider === undefined) {
        setIsConnecting(false);
        disconnect();

        return new Error(
          `The associated provider for account ${defaultAccount.address} could not be located`,
        );
      }

      setProvider(newProvider);
      setAccounts(accounts);
      setActiveAccountAddress(assertSubstrateAddress(defaultAccount.address));
      setIsConnecting(false);

      return true;
    },
    [setAccounts, setActiveAccountAddress, setProvider, disconnect],
  );

  const connectWalletConnectV2 = useCallback(
    async (projectId: string): Promise<Error | true> => {
      if (evmChain === null) {
        return new Error('Not connected to EVM chain yet');
      }

      assert(
        evmChain.rpcUrls.default.http.length > 1,
        "Active EVM chain doesn't have any RPC URLs defined in its config",
      );

      setIsConnecting(true);

      try {
        const provider = await EthereumProvider.init({
          // Required from WalletConnect Cloud.
          projectId,
          chains: [evmChain.id],
          showQrModal: true,
          rpcMap: { 1: evmChain.rpcUrls.default.http[0] },
        });

        setProvider(provider);
      } catch (error) {
        return ensureError(error);
      } finally {
        setIsConnecting(false);
      }

      return true;
    },
    [evmChain, setProvider],
  );

  const connectEvmWallet = useCallback(async (): Promise<Error | true> => {
    try {
      // Check if window.ethereum is available.
      if (typeof window.ethereum === 'undefined') {
        return new Error(
          'No EVM provider detected (window.ethereum is undefined)',
        );
      }

      setIsConnecting(true);

      // Request account access.
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      // No accounts found.
      if (!accounts || accounts.length === 0) {
        setIsConnecting(false);

        return new Error('No EVM accounts found');
      }

      const evmAccounts = accounts.map((address) => ({
        address,
        meta: { source: 'EVM' },
      }));

      // TODO: Obtain this from local storage, persist what was the last connected account.
      const defaultAccount = assertEvmAddress(evmAccounts[0].address);

      setProvider(window.ethereum);
      setAccounts(evmAccounts);
      setActiveAccountAddress(defaultAccount);

      return true;
    } catch (possibleError) {
      const error = ensureError(possibleError);

      console.error('Failed to connect EVM wallet:', error);

      return error;
    } finally {
      setIsConnecting(false);
    }
  }, [setAccounts, setActiveAccountAddress, setProvider]);

  const activeAccount = useMemo(() => {
    if (accounts === undefined || activeAccountAddress === undefined) {
      return null;
    }

    return (
      accounts.find((account) => account.address === activeAccountAddress) ??
      null
    );
  }, [accounts, activeAccountAddress]);

  const isConnected = activeAccount !== null;

  // TODO: Debugging.
  useEffect(() => {
    console.debug('IS CONNECTING', isConnecting);
    console.debug('ACCOUNT', activeAccount);
  }, [activeAccount, isConnecting]);

  return {
    isConnected,
    isConnecting,
    activeAccount,
    provider,
    trySwitchAccount,
    disconnect,
    connectSubstrateWallet,
    connectEvmWallet,
    connectWalletConnectV2,
  };
};

export default useProvider;
