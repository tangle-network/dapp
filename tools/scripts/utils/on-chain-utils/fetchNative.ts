import { ApiPromise } from '@polkadot/api';
import {
  LOCALNET_CHAIN_IDS,
  SELF_HOSTED_CHAIN_IDS,
} from '@webb-tools/dapp-config/src/chains';
import { DEFAULT_NATIVE_INDEX } from '@webb-tools/dapp-config/src/constants';
import { DEFAULT_EVM_CURRENCY } from '@webb-tools/dapp-config/src/currencies';
import { ICurrency } from '@webb-tools/dapp-config/src/types';
import { parseTypedChainId } from '@webb-tools/sdk-core';
import { ZERO_ADDRESS } from '@webb-tools/utils';
import chainData from './fixtures/native.json';

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
    address: ZERO_ADDRESS,
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
  provider?: ApiPromise
): Promise<ICurrency> {
  if (provider instanceof ApiPromise) {
    return fetchSubstrateNativeCurrency(provider);
  }

  return fetchEVMNativeCurrency(typedChainId);
}

export default fetchNativeCurrency;
