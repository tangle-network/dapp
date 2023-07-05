import {
  ERC20__factory,
  FungibleTokenWrapper__factory,
  VAnchor__factory,
} from '@webb-tools/contracts';
import { EVMChainId, zeroAddress } from '@webb-tools/dapp-types';
import { ChainType, parseTypedChainId } from '@webb-tools/sdk-core';

import { getContract, type PublicClient } from 'viem';
import { ZERO_BIG_INT } from '../../';
import { ChainAddressConfig } from '../../anchors';
import {
  LOCALNET_CHAIN_IDS,
  SELF_HOSTED_CHAIN_IDS,
  chainsConfig,
} from '../../chains';
import { CurrencyConfig, DEFAULT_EVM_CURRENCY } from '../../currencies';
import { ICurrency } from '../../types';
import { CurrencyResponse, OnChainConfigBase } from '../on-chain-config-base';

// The chain info is retrieved from https://github.com/ethereum-lists/chains
const CHAIN_URL = 'https://chainid.network/chains.json';

// the singleton instance of the EVM on-chain config with lazy initialization
let EVMOnChainConfigInstance: EVMOnChainConfig;

// Cache the chain data
let chainData: Array<{
  // The native currencies response doesn't include the address
  nativeCurrency: Omit<ICurrency, 'address'>;
  chainId: number;
}> = [];

// Cache the currencies config
let cachedCurrenciesConfig: {
  currenciesConfig: Record<number, CurrencyConfig>;
  fungibleToWrappableMap: Map<number, Map<number, Set<number>>>;
  anchorConfig: Record<number, ChainAddressConfig>;
};

export class EVMOnChainConfig extends OnChainConfigBase {
  private constructor() {
    super();
  }

  static getInstance() {
    if (!EVMOnChainConfigInstance) {
      EVMOnChainConfigInstance = new EVMOnChainConfig();
    }
    return EVMOnChainConfigInstance;
  }

  async fetchNativeCurrency(
    typedChainId: number,
    _?: PublicClient
  ): Promise<ICurrency | null> {
    // First check if the native currency is already cached
    const cachedNativeCurrency = this.nativeCurrencyCache.get(typedChainId);
    if (cachedNativeCurrency) {
      return cachedNativeCurrency;
    }

    // Validate the chainType is EVM and get the chaindId
    const { chainId } = this.assertChainType(typedChainId, ChainType.EVM);

    // Maybe evn localnet or self hosted
    const customChainIds = LOCALNET_CHAIN_IDS.concat(SELF_HOSTED_CHAIN_IDS);
    if (customChainIds.includes(chainId)) {
      this.nativeCurrencyCache.set(typedChainId, DEFAULT_EVM_CURRENCY);
      return DEFAULT_EVM_CURRENCY;
    }

    if (!chainData.length) {
      try {
        const resp = await fetch(CHAIN_URL);
        if (!resp.ok) {
          throw new Error(`Failed to fetch chain data from ${CHAIN_URL}`);
        }

        chainData = await resp.json();
      } catch (error) {
        console.error(
          'Unable to retrieve native token information, fallback to default',
          error
        );
        return DEFAULT_EVM_CURRENCY;
      }
    }

    const chain = chainData.find((chain) => chain.chainId === chainId);
    if (!chain) {
      console.error(
        `Found unsupported chainId ${chainId} for EVM, fallback to default`
      );
      return DEFAULT_EVM_CURRENCY;
    }

    // Parse the native currency
    const nativeCurrency = {
      ...chain.nativeCurrency,
      address: zeroAddress, // EVM native currency doesn't have an address
    };

    // Cache the native currency
    this.nativeCurrencyCache.set(typedChainId, nativeCurrency);

    return nativeCurrency;
  }

  async fetchFungibleCurrency(
    typedChainId: number,
    anchorAddress: string,
    provider: PublicClient
  ): Promise<ICurrency | null> {
    // First check if the fungible currency is already cached
    const cachedFungibleCurrency = this.fungibleCurrencyCache.get(typedChainId);
    if (cachedFungibleCurrency) {
      if (cachedFungibleCurrency instanceof Error) {
        return null;
      }

      return cachedFungibleCurrency;
    }

    // Validate the chainType is EVM and get the chaindId
    this.assertChainType(typedChainId, ChainType.EVM);

    try {
      const vAcnhorContract = getContract({
        address: `0x${anchorAddress.replace('0x', '')}`,
        abi: VAnchor__factory.abi,
        publicClient: provider,
      });

      const fungibleCurrencyAddress = await vAcnhorContract.read.token();

      const fungibleCurrencyContract = getContract({
        address: fungibleCurrencyAddress,
        abi: ERC20__factory.abi,
        publicClient: provider,
      });

      // This will be batched in one call
      const [name, symbol, decimals] = await Promise.all([
        fungibleCurrencyContract.read.name(),
        fungibleCurrencyContract.read.symbol(),
        fungibleCurrencyContract.read.decimals(),
      ]);
      const fungibleCurrency = {
        address: fungibleCurrencyAddress,
        decimals,
        symbol,
        name,
      };

      // Cache the fungible currency
      this.fungibleCurrencyCache.set(typedChainId, fungibleCurrency);
      return fungibleCurrency;
    } catch (error) {
      const chain = chainsConfig[typedChainId]?.name ?? 'Unknown';
      console.error(
        `Unable to retrieve fungible token information on ${chain}`,
        error
      );
      // Cache the error
      this.fungibleCurrencyCache.set(typedChainId, error as Error);
    }

    return null;
  }

  async fetchWrappableCurrencies(
    fungibleCurrency: ICurrency,
    typedChainId: number,
    provider: PublicClient
  ): Promise<ICurrency[]> {
    // First check if the wrappable currencies are already cached
    const cachedCurrencies = this.wrappableCurrenciesCache.get(typedChainId);
    if (cachedCurrencies) {
      if (cachedCurrencies instanceof Error) {
        return [];
      }

      return cachedCurrencies;
    }

    // Validate the chainType is EVM and get the chaindId
    this.assertChainType(typedChainId, ChainType.EVM);

    const fungibleTokenWrapperContract = getContract({
      address: `0x${fungibleCurrency.address.replace('0x', '')}`,
      abi: FungibleTokenWrapper__factory.abi,
      publicClient: provider,
    });

    try {
      // This will be batched in one call
      const [addressesWithNative, isNativeAllowed] = await Promise.all([
        fungibleTokenWrapperContract.read.getTokens(),
        fungibleTokenWrapperContract.read.isNativeAllowed(),
      ]);

      // Filter the zero addresses because they are not ERC20 tokens
      // and we use the isNativeAllowed flag to determine if native currency is allowed
      const addresses = addressesWithNative.filter(
        (address) => BigInt(address) !== ZERO_BIG_INT
      );

      const wrappableERC20Contracts = addresses.map((address) =>
        getContract({
          address,
          abi: ERC20__factory.abi,
          publicClient: provider,
        })
      );

      const wrappableCurrenciesResponse = await Promise.allSettled<ICurrency>(
        wrappableERC20Contracts.map(async (contractInstance) => {
          // This will be batched in one call
          const [name, symbol, decimals] = await Promise.all([
            contractInstance.read.name(),
            contractInstance.read.symbol(),
            contractInstance.read.decimals(),
          ]);

          return {
            address: contractInstance.address,
            decimals,
            symbol,
            name,
          };
        })
      );

      const wrappableCurrencies = wrappableCurrenciesResponse
        .map((resp) => (resp.status === 'fulfilled' ? resp.value : null))
        .filter((currency): currency is ICurrency => Boolean(currency));

      if (isNativeAllowed) {
        const nativeCurrency = await this.fetchNativeCurrency(typedChainId);
        if (nativeCurrency) {
          wrappableCurrencies.push(nativeCurrency);
        }
      }

      // Cache the wrappable currencies
      this.wrappableCurrenciesCache.set(typedChainId, wrappableCurrencies);
      return wrappableCurrencies;
    } catch (error) {
      console.error('Unable to retrieve wrappable tokens information', error);
      // Cache the error
      this.wrappableCurrenciesCache.set(typedChainId, error as Error);
    }

    return [];
  }

  async fetchCurrenciesConfig(
    anchorConfig: Record<number, string[]>,
    providerFactory: (typedChainId: number) => Promise<PublicClient>,
    existedCurreniciesConfig: Record<number, CurrencyConfig> = {},
    // prettier-ignore
    existedFungibleToWrappableMap: Map<number, Map<number, Set<number>>> = new Map(),
    existedAnchorConfig: Record<number, ChainAddressConfig> = {}
  ): Promise<typeof cachedCurrenciesConfig> {
    if (cachedCurrenciesConfig) {
      return cachedCurrenciesConfig;
    }

    // Get all evm typed chain ids from the anchor config
    let evmTypedChainIds = Object.keys(anchorConfig)
      // Filter only evm chains
      .filter((typedChainId) => {
        const { chainType } = parseTypedChainId(+typedChainId);
        return chainType === ChainType.EVM;
      });

    // Filter the chains if it is not working
    const typedChainIdBooleans = await Promise.all(
      evmTypedChainIds.map(async (typedChainId) => {
        try {
          const provider = await providerFactory(+typedChainId);
          await provider.getChainId();
          return true;
        } catch (error) {
          return false;
        }
      })
    );
    evmTypedChainIds = evmTypedChainIds.filter(
      (_, index) => typedChainIdBooleans[index]
    );

    if (evmTypedChainIds.length === 0) {
      return {
        currenciesConfig: existedCurreniciesConfig,
        fungibleToWrappableMap: existedFungibleToWrappableMap,
        anchorConfig: existedAnchorConfig,
      };
    }

    // Fetch all native currencies (not in try catch because it not call any contract)
    const nativeCurrenciesWithNull = await Promise.all(
      evmTypedChainIds.map(async (typedChainId) => ({
        typedChainId: +typedChainId,
        nativeCurrency: await this.fetchNativeCurrency(+typedChainId),
      }))
    );

    const nativeCurrencies = nativeCurrenciesWithNull.filter(
      (
        currency
      ): currency is Pick<
        CurrencyResponse,
        'typedChainId' | 'nativeCurrency'
      > => Boolean(currency.nativeCurrency)
    );

    // Fetch all fungible currencies
    const fungibleCurrenciesWithNull = await Promise.allSettled(
      nativeCurrencies.map(
        async ({ typedChainId, nativeCurrency: nativeCurrency }) => {
          const provider = await providerFactory(typedChainId);

          // Support multiple anchor addresses for the same chain
          const anchorAddresses = anchorConfig[typedChainId];
          if (!anchorAddresses || anchorAddresses.length === 0) {
            console.error('No anchor address found for chain', typedChainId);
            return [];
          }

          // Fetch the fungible currency
          const fungibleCurrencies = await Promise.all(
            anchorAddresses.map(async (address) => {
              const fungible = await this.fetchFungibleCurrency(
                typedChainId,
                address,
                provider
              );

              return {
                typedChainId,
                nativeCurrency,
                fungibleCurrency: fungible,
                anchorAddressOrTreeId: address,
              };
            })
          );

          return fungibleCurrencies;
        }
      )
    );

    const fungibleCurrencies = fungibleCurrenciesWithNull
      .map((resp) => (resp.status === 'fulfilled' ? resp.value : null))
      .filter(
        (
          currencies
        ): currencies is {
          anchorAddressOrTreeId: string;
          fungibleCurrency: ICurrency | null;
          nativeCurrency: ICurrency;
          typedChainId: number;
        }[] => !!currencies && currencies.length > 0
      )
      .reduce((acc, currencies) => [...acc, ...currencies], [])
      .filter(
        (
          currency
        ): currency is {
          anchorAddressOrTreeId: string;
          fungibleCurrency: ICurrency;
          nativeCurrency: ICurrency;
          typedChainId: number;
        } => currency.fungibleCurrency !== null
      );

    // Fetch all wrappable currencies
    const wrappableCurrenciesWithNull = await Promise.allSettled(
      fungibleCurrencies.map(
        async ({
          typedChainId,
          nativeCurrency,
          fungibleCurrency,
          anchorAddressOrTreeId,
        }) => {
          const provider = await providerFactory(typedChainId);
          const wrappables = await this.fetchWrappableCurrencies(
            fungibleCurrency,
            typedChainId,
            provider
          );

          return {
            anchorAddressOrTreeId,
            fungibleCurrency,
            nativeCurrency,
            typedChainId,
            wrappableCurrencies: wrappables,
          };
        }
      )
    );

    const wrappableCurrencies = wrappableCurrenciesWithNull
      .map((resp) => (resp.status === 'fulfilled' ? resp.value : null))
      .filter(
        (currency): currency is CurrencyResponse =>
          !!currency && Array.isArray(currency.wrappableCurrencies)
      );

    const config = this.addCurrenciesIntoConfig(
      wrappableCurrencies,
      existedCurreniciesConfig,
      existedFungibleToWrappableMap,
      existedAnchorConfig
    );
    cachedCurrenciesConfig = config;
    return config;
  }
}
