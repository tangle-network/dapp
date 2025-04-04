// Copyright 2024 @tangle-network/
// SPDX-License-Identifier: Apache-2.0

import { WebbApiProvider } from '@tangle-network/abstract-api-provider';
import { ApiConfig } from '@tangle-network/dapp-config';
import { WalletId } from '@tangle-network/dapp-types';
import { WebbError, WebbErrorCodes } from '@tangle-network/dapp-types';
import { PhantomProvider, WebbSolanaProvider } from './ext-provider';

export const detectPhantom = async (): Promise<boolean> => {
  try {
    if ('phantom' in window && window.phantom?.solana) {
      return !!window.phantom.solana.isPhantom;
    }

    if ('solana' in window && window.solana) {
      return !!window.solana.isPhantom;
    }

    return false;
  } catch (error) {
    console.error('Error detecting Phantom wallet:', error);
    return false;
  }
};

export const getPhantomProvider = (): PhantomProvider | null => {
  if ('phantom' in window && window.phantom?.solana) {
    const provider = window.phantom.solana;
    return provider as unknown as PhantomProvider;
  }

  if ('solana' in window && window.solana?.isPhantom) {
    return window.solana as unknown as PhantomProvider;
  }

  return null;
};

export const createSolanaProvider = async (
  walletId: WalletId,
  chainId: number,
  config: ApiConfig,
): Promise<WebbApiProvider> => {
  if (walletId !== WalletId.Phantom) {
    throw WebbError.from(WebbErrorCodes.UnsupportedWallet);
  }

  const provider = getPhantomProvider();
  if (!provider) {
    throw WebbError.from(WebbErrorCodes.PhantomExtensionNotInstalled);
  }

  try {
    if (!provider.connect) {
      throw WebbError.from(WebbErrorCodes.FailedToConnectWallet);
    }

    await provider.connect();

    return WebbSolanaProvider.init(provider, chainId, config);
  } catch (error) {
    console.error('Error creating Solana provider:', error);
    throw WebbError.from(WebbErrorCodes.FailedToConnectWallet);
  }
};

// Remove this!
declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom?: boolean;
      };
    };
    solana?: {
      isPhantom?: boolean;
    };
  }
}
