// Copyright 2023 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { SupportedBrowsers } from '@webb-tools/browser-utils/platform';

export type SupportedConnector = MetaMaskConnector | WalletConnectConnector;

export interface WalletConfig {
  id: number;
  Logo: React.ReactElement;
  name: string;
  title: string;
  platform: string;

  /**
   * Homepage url of the wallet
   */
  homeLink: string;

  /**
   * Install urls of the wallet in chrome, firefox, etc...
   */
  installLinks?: Record<SupportedBrowsers, string> | undefined;

  /**
   * the wallet isn't live yet
   */
  enabled: boolean;

  /**
   * a function that will tell weather the wallet is installed or reachable
   */
  detect(): boolean | Promise<boolean>;

  /**
   * a list of supported typed chain ids
   */
  supportedChainIds: number[];

  /**
   * The wagmi connector for EVM wallets
   */
  connector?: SupportedConnector;
}

export type ManagedWallet = {
  connected: boolean;
  endSession(): Promise<void>;
  canEndSession: boolean;
} & WalletConfig;
