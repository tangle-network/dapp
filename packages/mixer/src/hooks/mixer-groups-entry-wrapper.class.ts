import '@webb-tools/protocol-substrate-types';

import type { PalletMixerMixerMetadata as MixerInfo } from '@polkadot/types/lookup';

import { Currency } from '@webb-dapp/api-providers';
import { Token } from '@webb-tools/sdk-core';

import { StorageKey } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';

export type NativeTokenProperties = {
  ss58Format: number | null;
  tokenDecimals: Array<number> | null;
  tokenSymbol: Array<string> | null;
};

export type MixerGroupItem = {
  id: number;
  amount: Balance;
  currency: Currency;
  token: Token;
};
export type MixerGroupEntry = [StorageKey, MixerInfo];
