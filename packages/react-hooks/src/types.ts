// Copyright 2017-2020 @polkadot/react-components authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CurrencyId, AccountId } from '@acala-network/types/interfaces';

export type CallParam = any;

export type CallParams = [] | [CallParam] | [CallParam, CallParam] | [CallParam, CallParam, CallParam] | any[];

export interface CallOptions <T> {
  defaultValue?: T;
  isSingle?: boolean;
  paramMap?: (params: any) => CallParams;
  transform?: (value: any) => T;
  withParams?: boolean;
}

export type CurrencyLike = CurrencyId | string;

export type AccountLike = AccountId | string;

export type WithNull<T> = T | null;

export type WithUndefined<T> = T | undefined;
