// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

export type AnchorInterface = {
  deposit(commitment: string): Promise<void>;
};
