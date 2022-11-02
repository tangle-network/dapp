// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { SupportedBrowsers } from '@webb-tools/browser-utils/platform';
import { PresetTypedChainId } from '@webb-tools/dapp-types';

export interface WalletConfig {
  id: number;
  Logo: React.ReactElement;
  name: string;
  title: string;
  platform: string;

  // Homepage url of the wallet
  homeLink: string;

  // Install urls of the wallet in chrome, firefox, etc...
  installLinks?: Record<SupportedBrowsers, string> | undefined;

  // the wallet isn't live yet
  enabled: boolean;

  /// a function that will tell weather the wallet is installed or reachable
  detect?(): boolean | Promise<boolean>;

  supportedChainIds: number[];

  // the default chain to connect wallet
  defaultChainToConnect: PresetTypedChainId;
}

export type ManagedWallet = {
  connected: boolean;
  endSession(): Promise<void>;
  canEndSession: boolean;
} & WalletConfig;
