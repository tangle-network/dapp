import { ApiPromise } from '@polkadot/api';
import { ICurrency } from '@webb-tools/dapp-config/src/on-chain-config/on-chain-config-base';
import { zeroAddress } from '@webb-tools/dapp-types';
import { parseTypedChainId } from '@webb-tools/sdk-core';
import { ethers } from 'ethers';

import chainData from './fixtures/native.json';
import {
  DEFAULT_EVM_CURRENCY,
  LOCALNET_CHAIN_IDS,
  SELF_HOSTED_CHAIN_IDS,
} from './shared';
import { DEFAULT_NATIVE_INDEX } from './shared';

/// Private Methods

async function fetchEVMNativeCurrency(
  typedChainId: number
): Promise<ICurrency> {
  const { chainId } = parseTypedChainId(typedChainId);

  // Maybe evn localnet or self hosted
  const customChainIds = LOCALNET_CHAIN_IDS.concat(SELF_HOSTED_CHAIN_IDS);
  if (customChainIds.includes(chainId)) {
    return DEFAULT_EVM_CURRENCY;
  }

  const chain = chainData.find((currency) => currency.chainId === chainId);

  if (!chain) {
    console.error('Native currency not found in the fixtures fallback to ETH');
    return DEFAULT_EVM_CURRENCY;
  }

  return {
    ...chain.nativeCurrency,
    address: zeroAddress,
  };
}

async function fetchSubstrateNativeCurrency(
  provider: ApiPromise
): Promise<ICurrency> {
  const name = provider.registry.chainTokens[DEFAULT_NATIVE_INDEX];
  const decimals = provider.registry.chainDecimals[DEFAULT_NATIVE_INDEX];
  // The native currency is always at index 0 in the asset registry pallet
  const address = DEFAULT_NATIVE_INDEX.toString();

  return {
    name,
    symbol: name,
    decimals,
    address,
  };
}

// Default method

async function fetchNativeCurrency(
  typedChainId: number,
  provider?: ethers.providers.Web3Provider | ApiPromise
): Promise<ICurrency> {
  if (provider instanceof ApiPromise) {
    return fetchSubstrateNativeCurrency(provider);
  }

  if (!provider || provider instanceof ethers.providers.Web3Provider) {
    return fetchEVMNativeCurrency(typedChainId);
  }

  throw new Error('Invalid provider');
}

export default fetchNativeCurrency;
