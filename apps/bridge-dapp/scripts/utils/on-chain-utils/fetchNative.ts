import { ApiPromise } from '@polkadot/api';
import { ICurrency } from '@webb-tools/dapp-config/src/on-chain-config/on-chain-config-base';
import { zeroAddress } from '@webb-tools/dapp-types';
import EVMChainId from '@webb-tools/dapp-types/src/EVMChainId';
import { parseTypedChainId } from '@webb-tools/sdk-core';
import { ethers } from 'ethers';

import chainData from './fixtures/native.json';

// Constants

const LOCALNET_CHAIN_IDS = [
  EVMChainId.HermesLocalnet,
  EVMChainId.AthenaLocalnet,
  EVMChainId.DemeterLocalnet,
];

const SELF_HOSTED_CHAIN_IDS = [
  EVMChainId.HermesOrbit,
  EVMChainId.AthenaOrbit,
  EVMChainId.DemeterOrbit,
];

const DEFAULT_EVM_CURRENCY: ICurrency = {
  name: 'Localnet Ether',
  symbol: 'ETH',
  decimals: 18,
  address: zeroAddress,
};

// The default native currency index in the asset registry pallet
const DEFAULT_NATIVE_INDEX = 0;

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
  provider?: ethers.providers.Provider | ApiPromise
): Promise<ICurrency> {
  if (provider instanceof ApiPromise) {
    return fetchSubstrateNativeCurrency(provider);
  }

  if (!provider || provider instanceof ethers.providers.Provider) {
    return fetchEVMNativeCurrency(typedChainId);
  }

  throw new Error('Invalid provider');
}

export default fetchNativeCurrency;
