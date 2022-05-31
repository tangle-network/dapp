// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { Storage } from '../storage';

export type NetworkStore = {
  networksConfig: Record<
    number,
    | {
        defaultAccount: string;
      }
    | undefined
  >;
  defaultNetwork?: number;
  defaultWallet?: number;
};
export type NetworkStorage = Storage<NetworkStore>;
