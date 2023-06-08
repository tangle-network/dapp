import { ICurrency } from '@webb-tools/dapp-config/on-chain-config/on-chain-config-base';
import { anchorDeploymentBlock } from '@webb-tools/dapp-config/src/anchors/anchor-config';
import { chainsConfig } from '@webb-tools/dapp-config/src/chains/chain-config';
import { ChainType, parseTypedChainId } from '@webb-tools/sdk-core';
import evmProviderFactory from '@webb-tools/web3-api-provider/src/utils/evmProviderFactory';
import chalk from 'chalk';
import { ethers } from 'ethers';

import fetchFungibleCurrency from './utils/on-chain-utils/fetchFungible';
import fetchNativeCurrency from './utils/on-chain-utils/fetchNative';

interface WrappableRecord {
  [fungibleAddress: string]: ICurrency[];
}

interface CurrenciesRecord {
  native: ICurrency;
  fungibles: ICurrency[];
  wrappables: WrappableRecord;
}

// For the fetching currency on chain effect
const anchorConfig = Object.keys(anchorDeploymentBlock).reduce(
  (acc, typedChainId) => {
    const addresses = Object.keys(anchorDeploymentBlock[+typedChainId]);
    if (addresses && addresses.length > 0) {
      acc[+typedChainId] = addresses;
    }
    return acc;
  },
  {} as Record<number, string[]>
);

// Private methods

async function filterActiveEVMChains(
  typedChainIds: number[]
): Promise<number[]> {
  return (
    await Promise.all(
      typedChainIds.map(async (typedChainId) => {
        try {
          const provider = await evmProviderFactory(typedChainId);
          await provider.getNetwork();
          return typedChainId;
        } catch (error) {
          return null;
        }
      })
    )
  ).filter((t): t is number => t !== null);
}

async function fetchNativeTask(
  typedChainIds: number[],
  providersRecord: Record<number, ethers.providers.Web3Provider>
) {
  console.log(chalk`[+] {cyan Fetching native currencies...}`);
  const nativeCurrencies = await typedChainIds.reduce(
    async (acc, typedChainId) => {
      const native = await acc;
      const provider = providersRecord[typedChainId];
      const nativeCurrency = await fetchNativeCurrency(typedChainId, provider);
      native[typedChainId] = {
        native: nativeCurrency,
      };
      return native;
    },
    {} as Promise<Record<number, Pick<CurrenciesRecord, 'native'>>>
  );
  const symbolsSet = Object.values(nativeCurrencies).reduce((acc, cur) => {
    acc.add(cur.native.symbol);
    return acc;
  }, new Set<string>());

  console.log(
    chalk`  => {green Found ${
      Object.keys(nativeCurrencies).length
    } native currencies with ${symbolsSet.size} symbols: ${Array.from(
      symbolsSet
    ).join(', ')}}`
  );
  return nativeCurrencies;
}

async function fetchFungibleTask(
  typedChainIds: number[],
  providersRecord: Record<number, ethers.providers.Web3Provider>
) {
  console.log(chalk`[+] {cyan Fetching fungible currencies...}`);
  const fungibleCurrencies = await typedChainIds.reduce(
    async (acc, typedChainId) => {
      const fungibles = await acc;
      const provider = providersRecord[typedChainId];

      const addresses = anchorConfig[typedChainId];
      const fungibleCurrencies = await Promise.all(
        addresses.map((address) => fetchFungibleCurrency(address, provider))
      );
      fungibles[typedChainId] = {
        fungibles: fungibleCurrencies,
      };
      return fungibles;
    },
    {} as Promise<Record<number, Pick<CurrenciesRecord, 'fungibles'>>>
  );

  // For logging
  const fungibleCount = Object.values(fungibleCurrencies).reduce(
    (acc, { fungibles }) => acc + fungibles.length,
    0
  );

  const symbolsSet = Object.values(fungibleCurrencies).reduce((acc, cur) => {
    const names = cur.fungibles.map((f) => f.symbol);
    names.forEach((name) => acc.add(name));
    return acc;
  }, new Set<string>());

  console.log(
    chalk`  => {green Found ${fungibleCount} fungible currencies with ${
      symbolsSet.size
    } symbols: ${Array.from(symbolsSet).join(', ')}}`
  );

  return fungibleCurrencies;
}

// Main function

async function main() {
  const typedChainIds = Object.keys(anchorDeploymentBlock);

  console.log(chalk.cyan.bold('Fetching on chain config on evm...'));

  // Filter out the active evm chains
  const evmTypedChainIds = await filterActiveEVMChains(
    typedChainIds
      .filter((typedChainId) => {
        const { chainType } = parseTypedChainId(+typedChainId);
        return chainType === ChainType.EVM;
      })
      .map((t) => +t)
  );

  const activeChainNames = evmTypedChainIds.map(
    (typedChainId) => chainsConfig[typedChainId].name
  );
  console.log(
    chalk`=> {green Found ${
      evmTypedChainIds.length
    } active evm chains: ${activeChainNames.join(', ')}}`
  );

  const providersRecord = await evmTypedChainIds.reduce(
    async (acc, typedChainId) => {
      const providers = await acc;
      const provider = await evmProviderFactory(typedChainId);
      providers[typedChainId] = provider;
      return providers;
    },
    {} as Promise<Record<number, ethers.providers.Web3Provider>>
  );

  const [nativeRecord, fungibleRecord] = await Promise.all([
    fetchNativeTask(evmTypedChainIds, providersRecord),
    fetchFungibleTask(evmTypedChainIds, providersRecord),
  ]);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
