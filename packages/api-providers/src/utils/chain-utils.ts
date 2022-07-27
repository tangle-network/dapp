// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { calculateTypedChainId } from '@webb-tools/sdk-core';

import { TypedChainId } from '../chains';
import { WebbError, WebbErrorCodes } from '../webb-error';
import { AppConfig } from '../';

export const getEVMChainName = (config: AppConfig, evmId: number): string => {
  const chain = Object.values(config.chains).find((chainsConfig) => chainsConfig.chainId === evmId);

  if (chain) {
    return chain.name;
  } else {
    throw WebbError.from(WebbErrorCodes.UnsupportedChain);
  }
};

export const getChainNameFromTypedChainId = (config: AppConfig, typedChainId: TypedChainId): string => {
  const chain = config.chains[calculateTypedChainId(typedChainId.chainType, typedChainId.chainId)];
  return chain.name;
};

export const getNativeCurrencySymbol = (config: AppConfig, evmId: number): string => {
  const chain = Object.values(config.chains).find((chainsConfig) => chainsConfig.chainId === evmId);

  if (chain) {
    const nativeCurrency = chain.nativeCurrencyId;

    return config.currencies[nativeCurrency].symbol;
  }

  return 'Unknown';
};
