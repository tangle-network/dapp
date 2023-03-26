// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

// The CurrencyType distinguishes how to interact with a particular currency in terms of
// web3 api calls.
export enum CurrencyType {
  ERC20,
  NATIVE,
  ORML,
}

// The CurrencyRole distinguishes how a currency may interact in the webb application
// - Wrappable refers to a currency that may be converted into a `Governable` token (i.e. a `webbToken`)
// - Governable refers to a currency that supports the wrapping of `Wrappable` currencies,
//   which can be modified from governance.
export enum CurrencyRole {
  Wrappable,
  Governable,
}
