// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import type { InjectedExtension } from '@polkadot/extension-inject/types';
import type { SupportedBrowsers } from '@webb-tools/browser-utils/platform/getPlatformMetaData';
import type { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { MetaMaskConnector, RainbowConnector } from './injected';

export type SupportedConnector =
  | MetaMaskConnector
  | WalletConnectConnector
  | RainbowConnector;

export interface WalletConfig {
  id: number;
  Logo: React.ReactElement;
  name: string;
  title: string;

  /** The wallet platform "EVM" or "Substrate" */
  platform: 'EVM' | 'Substrate';

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
  detect(
    appName: string
  ): Promise<SupportedConnector | InjectedExtension | undefined>;

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
