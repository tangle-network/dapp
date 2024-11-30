// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { Currency } from '../currency';

export class Bridge {
  constructor(
    readonly currency: Currency,
    readonly targets: Record<number, string>,
  ) {
    this.currency = currency;
    this.targets = targets;
  }
}
