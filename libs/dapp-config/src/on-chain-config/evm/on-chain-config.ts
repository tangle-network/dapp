import { Provider } from '@ethersproject/abstract-provider';
import { retryPromise } from '@webb-tools/browser-utils';
import {
  ERC20__factory,
  FungibleTokenWrapper__factory,
  VAnchor__factory,
} from '@webb-tools/contracts';
import { EVMChainId, zeroAddress } from '@webb-tools/dapp-types';
import { ChainType, parseTypedChainId } from '@webb-tools/sdk-core';

import { ChainAddressConfig } from '../../anchors';
import { chainsConfig } from '../../chains';
import { CurrencyConfig } from '../../currencies';
import {
  CurrencyResponse,
  ICurrency,
  OnChainConfigBase,
} from '../on-chain-config-base';

// The chain info is retrieved from https://github.com/ethereum-lists/chains
const CHAIN_URL = 'https://chainid.network/chains.json';

// the singleton instance of the EVM on-chain config with lazy initialization
let EVMOnChainConfigInstance: EVMOnChainConfig;

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

const DEFAULT_CURRENCY: ICurrency = {
  name: 'Localnet Ether',
  symbol: 'ETH',
  decimals: 18,
  address: zeroAddress,
};

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
    _?: Provider
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
      this.nativeCurrencyCache.set(typedChainId, DEFAULT_CURRENCY);
      return DEFAULT_CURRENCY;
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
        return DEFAULT_CURRENCY;
      }
    }

    const chain = chainData.find((chain) => chain.chainId === chainId);
    if (!chain) {
      console.error(
        `Found unsupported chainId ${chainId} for EVM, fallback to default`
      );
      return DEFAULT_CURRENCY;
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
    provider: Provider
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
      const vAcnhorContract = VAnchor__factory.connect(anchorAddress, provider);
      const fungibleCurrencyAddress = await retryPromise(vAcnhorContract.token);
      const fungibleCurrencyContract = ERC20__factory.connect(
        fungibleCurrencyAddress,
        provider
      );

      const [name, symbol, decimals] = await Promise.all([
        retryPromise(fungibleCurrencyContract.name),
        retryPromise(fungibleCurrencyContract.symbol),
        retryPromise(fungibleCurrencyContract.decimals),
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
    provider: Provider
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

    const fungibleTokenWrapperContract = FungibleTokenWrapper__factory.connect(
      fungibleCurrency.address,
      provider
    );

    try {
      // Filter the zero addresses because they are not ERC20 tokens
      // and we use the isNativeAllowed flag to determine if native currency is allowed
      const addresses = (
        await retryPromise(fungibleTokenWrapperContract.getTokens)
      ).filter((address) => address !== zeroAddress);

      const wrappableERC20Contracts = addresses.map((address) =>
        ERC20__factory.connect(address, provider)
      );

      const wrappableCurrenciesResponse = await Promise.allSettled<ICurrency>(
        wrappableERC20Contracts.map(async (ERC20Contract) => {
          const [name, symbol, decimals] = await Promise.all([
            retryPromise(ERC20Contract.name),
            retryPromise(ERC20Contract.symbol),
            retryPromise(ERC20Contract.decimals),
          ]);
          return {
            address: ERC20Contract.address,
            decimals,
            symbol,
            name,
          };
        })
      );

      const wrappableCurrencies = wrappableCurrenciesResponse
        .map((resp) => (resp.status === 'fulfilled' ? resp.value : null))
        .filter((currency): currency is ICurrency => Boolean(currency));

      // Check if  is allowed
      const isNativeAllowed = await retryPromise(
        fungibleTokenWrapperContract.isNativeAllowed
      );
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
    providerFactory: (typedChainId: number) => Promise<Provider>,
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
          await provider.getNetwork();
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
