// Copyright 2024 @tangle-network/
// SPDX-License-Identifier: Apache-2.0

import type { InjectedWindowProvider } from '@polkadot/extension-inject/types';
import type { SupportedBrowsers } from '@tangle-network/browser-utils/platform/getPlatformMetaData';

export interface WalletConfig {
  id: number;
  Logo: React.ReactElement;

  rdns?: string;
  name: string;
  title: string;

  /** The wallet platform "EVM", "Substrate" or "Solana" */
  platform: 'EVM' | 'Substrate' | 'Solana';

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
   * - true - indicates a **EVM** wallet available
   * - InjectedWindowProvider - indicates a **Substrate** wallet available
   */
  detect(
    appName: string,
  ): Promise<boolean | InjectedWindowProvider | undefined>;

  /**
   * a list of supported typed chain ids
   */
  supportedChainIds: number[];
}

export type ManagedWallet = {
  connected: boolean;
  endSession(): Promise<void>;
  canEndSession: boolean;
} & WalletConfig;
