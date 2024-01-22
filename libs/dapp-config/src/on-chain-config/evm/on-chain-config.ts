import {
  ERC20__factory,
  FungibleTokenWrapper__factory,
  VAnchor__factory,
} from '@webb-tools/contracts';
import { ChainType, parseTypedChainId } from '@webb-tools/sdk-core';
import { ZERO_ADDRESS } from '@webb-tools/utils';
import { getContract, type PublicClient } from 'viem';
import { ChainAddressConfig } from '../../anchors';
import { chainsConfig } from '../../chains';
import { ZERO_BIG_INT } from '../../constants';
import { CurrencyConfig } from '../../currencies';
import { ICurrency } from '../../types';
import { CurrencyResponse, OnChainConfigBase } from '../on-chain-config-base';

// the singleton instance of the EVM on-chain config with lazy initialization
let EVMOnChainConfigInstance: EVMOnChainConfig;

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
        client: provider,
      });

      const fungibleCurrencyAddress = await vAcnhorContract.read.token();

      const fungibleCurrencyContract = getContract({
        address: fungibleCurrencyAddress,
        abi: ERC20__factory.abi,
        client: provider,
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
      client: provider,
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
          client: provider,
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
        const nativeCurrency = await chainsConfig[typedChainId]?.nativeCurrency;
        if (nativeCurrency) {
          wrappableCurrencies.push({
            ...nativeCurrency,
            address: ZERO_ADDRESS,
          });
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

    const nativeCurrencies = evmTypedChainIds.map((typedChainId) => ({
      typedChainId: +typedChainId,
      nativeCurrency: {
        address: ZERO_ADDRESS,
        ...chainsConfig[+typedChainId]?.nativeCurrency,
      } satisfies ICurrency,
    }));

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
